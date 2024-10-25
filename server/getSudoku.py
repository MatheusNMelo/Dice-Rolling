import json
import random

import requests
from sudoku import Sudoku


def get_external_data():
    url = "https://beacon.nist.gov/beacon/2.0/pulse/last"
    response = None

    try:
        response = requests.get(url, timeout=3)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        print("Timed out =(")
        return None
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

    if response.status_code == 200:
        data = response.json()
        output = data["pulse"]["outputValue"]
        return int(output, 16)


def get_seed():
    decimal = str(get_external_data())
    sample = int("".join(random.sample(decimal, int((len(decimal)) / 2))))
    return sample


if __name__ == "__main__":
    SEEDED = get_seed()

    result = Sudoku(3, 3, seed=SEEDED).difficulty(0.5).board
    for i, row in enumerate(result):
        for j, value in enumerate(row):
            if value is None:
                result[i][j] = -1
    print(json.dumps(result))
