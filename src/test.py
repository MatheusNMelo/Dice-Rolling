import requests

url = "https://beacon.nist.gov/beacon/2.0/pulse/last"
response = None

response = requests.get(url, timeout=3)
response.raise_for_status()

if response.status_code == 200:
    data = response.json()
    output = data["pulse"]["outputValue"]
    print(output)
