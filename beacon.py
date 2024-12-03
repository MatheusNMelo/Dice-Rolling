import asyncio
import hashlib
import logging
import os
import secrets
import threading
import time
from typing import Any, Dict

import aiohttp
import schedule
from flask import Flask, jsonify

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)


class EnhancedRandomnessBeacon:
    def __init__(self):
        self.last_value = None
        self.round = 0
        self.latest_generation = None

    async def _fetch_beacon_data(self):
        async with aiohttp.ClientSession() as session:
            nist_response = await session.get(
                "https://beacon.nist.gov/beacon/2.0/pulse/last"
            )
            nist_data = await nist_response.json()
            nist_value = nist_data["pulse"]["outputValue"]

            drand_response = await session.get("https://api.drand.sh/public/latest")
            drand_data = await drand_response.json()
            drand_value = drand_data["randomness"]

            return nist_value.encode(), bytes.fromhex(drand_value[2:])

    async def _gather_entropy(self) -> bytes:
        nist_entropy, drand_entropy = await self._fetch_beacon_data()

        system_sources = [
            secrets.token_bytes(32),
            os.urandom(32),
            str(time.time_ns()).encode(),
            str(os.cpu_count()).encode(),
            os.urandom(16),  # Entropia adicional
            nist_entropy or b"",
            drand_entropy or b"",
        ]
        mixed = hashlib.blake2b(
            b"".join(system_sources), salt=os.urandom(16), person=b"EnhancedBeacon"
        ).digest()
        return mixed

    def generate(self) -> Dict[str, Any]:

        # Usa asyncio para buscar beacons
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        entropy = loop.run_until_complete(self._gather_entropy())
        loop.close()

        timestamp = int(time.time())
        message = b"".join(
            [
                str(timestamp).encode(),
                self.last_value.encode() if self.last_value else b"",
                entropy,
            ]
        )

        # Duplo hash com SHA3-512
        hash1 = hashlib.sha3_512(message).digest()
        new_value = hashlib.sha3_512(hash1).hexdigest()

        self.last_value = new_value
        self.round += 1

        result = {
            "round": self.round,
            "randomness": new_value,
            "timestamp": timestamp,
            "previous": self.last_value,
        }

        self.latest_generation = result
        return result


beacon = EnhancedRandomnessBeacon()


def scheduled_generation():
    beacon.generate()


@app.route("/public/latest")
def latest():
    return jsonify(beacon.latest_generation or beacon.generate())


def run_schedule():
    while True:
        schedule.run_pending()
        time.sleep(1)


if __name__ == "__main__":

    schedule.every().minute.at(":00").do(scheduled_generation)

    scheduler_thread = threading.Thread(target=run_schedule, daemon=True)
    scheduler_thread.start()

    beacon.generate()

    app.run(host="0.0.0.0", port=8080)
