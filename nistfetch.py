import time

import mysql.connector
import requests
from mysql.connector import Error

# Configurações do banco de dados
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "7355608",
    "database": "games",
}

# URL do NIST Randomness Beacon
beacon_url = "https://beacon.nist.gov/beacon/2.0/pulse/last"


def fetch_randomness():
    try:
        response = requests.get(beacon_url)
        response.raise_for_status()
        data = response.json()
        randomness = data["pulse"]["outputValue"]
        return randomness
    except requests.RequestException as e:
        print(f"Error fetching randomness: {e}")
        return None


def save_randomness_to_db(randomness):
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            cursor = connection.cursor()
            create_table_query = """
            CREATE TABLE IF NOT EXISTS nist_randomness (
                id INT AUTO_INCREMENT PRIMARY KEY,
                randomness VARCHAR(255) NOT NULL,
                fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
            cursor.execute(create_table_query)
            insert_query = "INSERT INTO nist_randomness (randomness) VALUES (%s)"
            cursor.execute(insert_query, (randomness,))
            connection.commit()
            print("Randomness value saved to database.")
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()


def main():
    try:
        while True:
            randomness = fetch_randomness()
            if randomness:
                save_randomness_to_db(randomness)
            time.sleep(60)  # Espera 60 segundos antes de buscar novamente
    except KeyboardInterrupt:
        print("Process interrupted by user. Exiting...")


if __name__ == "__main__":
    main()
