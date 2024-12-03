# test_beacon.py
import hashlib
import json
import unittest
from unittest.mock import patch

import requests

from beacon import EnhancedRandomnessBeacon


class TestRandomnessBeacon(unittest.TestCase):
    def setUp(self):
        self.beacon = EnhancedRandomnessBeacon()

    def test_pulse_structure(self):
        """Testa estrutura do pulso"""
        result = self.beacon.generate()

        self.assertIn("round", result)
        self.assertIn("randomness", result)
        self.assertIn("timestamp", result)
        self.assertIn("previous", result)

    def test_randomness_format(self):
        """Testa formato da randomness"""
        result = self.beacon.generate()

        # Verifica se é string hex válida
        self.assertTrue(all(c in "0123456789abcdef" for c in result["randomness"]))
        # Verifica tamanho (512 bits = 128 chars hex)
        self.assertEqual(len(result["randomness"]), 128)

    def test_rounds_increment(self):
        """Testa incremento das rounds"""
        r1 = self.beacon.generate()
        r2 = self.beacon.generate()
        self.assertEqual(r2["round"], r1["round"] + 1)

    def test_previous_chain(self):
        """Testa encadeamento dos valores"""
        r1 = self.beacon.generate()
        r2 = self.beacon.generate()
        self.assertEqual(r2["previous"], r1["randomness"])

    @patch("aiohttp.ClientSession.get")
    def test_external_beacons(self, mock_get):
        """Testa integração com beacons externos"""
        mock_get.return_value.__aenter__.return_value.json.return_value = {
            "pulse": {"outputValue": "a" * 128},
            "randomness": "0x" + "b" * 64,
        }

        result = self.beacon.generate()
        self.assertIsNotNone(result["randomness"])

    def test_entropy_size(self):
        """Testa tamanho da entropia"""
        entropy = self.beacon._gather_entropy()
        self.assertEqual(len(entropy), 64)  # 512 bits


if __name__ == "__main__":
    unittest.main()
