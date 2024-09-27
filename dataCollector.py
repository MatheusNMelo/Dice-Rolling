import sqlite3
import time
import requests

from apscheduler.schedulers.background import BlockingScheduler as scheduler


def get_db_connection():
    conn = sqlite3.connect("tcc.db")
    conn.row_factory = sqlite3.Row
    return conn


def dbStore(data):
    pulse = data["pulse"]

    conn = get_db_connection()
    cur = conn.cursor()

    uri = pulse["uri"]
    cipher_suite = pulse["cipherSuite"]
    period = pulse["period"]
    certificate_id = pulse["certificateId"]
    chain_index = pulse["chainIndex"]
    version = pulse["version"]
    time_stamp = pulse["timeStamp"]
    pulse_index = pulse["pulseIndex"]
    local_random_value = pulse["localRandomValue"]
    # external = pulse["external"]
    # listValues = pulse["listValues"]
    precommitment_value = pulse["precommitmentValue"]
    signature_value = pulse["signatureValue"]
    output_value = pulse["outputValue"]

    cur.execute(
        "INSERT INTO pulses (uri, cipherSuite, period, certificateId, chainIndex, version, timeStamp, pulseIndex, localRandomValue, precommitmentValue, signatureValue, outputValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            uri,
            cipher_suite,
            period,
            certificate_id,
            chain_index,
            version,
            time_stamp,
            pulse_index,
            local_random_value,
            precommitment_value,
            signature_value,
            output_value,
        ),
    )
    conn.commit()
    cur.close()
    conn.close()
    print(f"Stored Succesfully! at {time_stamp}")
    return


def get_external_data(url):
    try:
        response = requests.get(url, timeout=3)
    except requests.exceptions.Timeout:
        print("Timed out =(")
    if response.status_code == 200:
        pulse = response.json()
        dbStore(pulse)


LAST_PULSE = "https://beacon.nist.gov/beacon/2.0/pulse/last"

try:
    print("Scheduler started, ctrl-c to exit!")
    while 1:
        get_external_data(LAST_PULSE)
        time.sleep(60)
except KeyboardInterrupt:
    print("Scheduler Stopped!")
