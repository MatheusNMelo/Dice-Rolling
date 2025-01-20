from itertools import groupby

import numpy as np
import pandas as pd
from scipy.stats import binomtest, chisquare, kstest, norm
from sqlalchemy import create_engine

# Configurar a conexão com o banco de dados usando SQLAlchemy
engine1 = create_engine("mysql+mysqlconnector://root:7355608@localhost/games")
engine2 = create_engine("mysql+mysqlconnector://root:7355608@192.168.217.147/beacon")

# Executar consultas SQL e carregar os dados em DataFrames do pandas
query1 = "SELECT * FROM nist_randomness"
query2 = "SELECT * FROM beacon_results"
df1 = pd.read_sql(query1, engine1)
df2 = pd.read_sql(query2, engine2)
df1 = df1.drop_duplicates(subset=["randomness"])


# Função para converter valores hexadecimais para binário
def hex_to_binary(hex_string):
    return [int(bit) for bit in bin(int(hex_string, 16))[2:].zfill(len(hex_string) * 4)]


# Converter a coluna 'randomness' de hexadecimal para binário
random_numbers = []
for hex_value in df2["randomness"]:
    binary_value = hex_to_binary(hex_value)
    random_numbers.extend(hex_to_binary(hex_value))


df_dropped = df2["randomness"].drop_duplicates()
print(f"Tamanho do DataFrame antes de remover duplicatas: {len(df2["randomness"])}")
print(f"Tamanho do DataFrame após remover duplicatas: {len(df_dropped)}")

total_hex_chars = sum(len(hex_value) for hex_value in df2["randomness"])
expected_length = total_hex_chars * 4
actual_length = len(random_numbers)

print(f"Expected length: {expected_length}, Actual length: {actual_length}")


# Função para o Teste de Frequência (Monobit)
def frequency_monobit_test(numbers):
    n = len(numbers)
    s = sum(numbers)
    p_value = binomtest(s, n, 0.5).pvalue
    return p_value


# Função para o Teste de Frequência em Blocos
def frequency_block_test(numbers, block_size):
    blocks = [numbers[i : i + block_size] for i in range(0, len(numbers), block_size)]
    p_values = [binomtest(sum(block), len(block), 0.5).pvalue for block in blocks]
    return p_values


# Função para o Teste de Corridas
def runs_test(numbers):
    n = len(numbers)
    runs = 1 + sum(numbers[i] != numbers[i - 1] for i in range(1, n))
    expected_runs = (2 * n - 1) / 3
    variance_runs = (16 * n - 29) / 90
    z = (runs - expected_runs) / np.sqrt(variance_runs)
    p_value = 2 * (1 - norm.cdf(abs(z)))
    return p_value


# Função para o Teste de Longest Runs of Ones in a Block
def longest_runs_of_ones_test(numbers, block_size):
    blocks = [numbers[i : i + block_size] for i in range(0, len(numbers), block_size)]
    longest_runs = [
        max(len(list(g)) for k, g in groupby(block) if k == 1) for block in blocks
    ]
    p_value = chisquare(longest_runs).pvalue
    return p_value


# Função para o Teste de Transformada Discreta de Fourier
def discrete_fourier_transform_test(numbers):
    transformed = np.fft.fft(numbers)
    magnitudes = np.abs(transformed)
    p_value = kstest(magnitudes, "norm").pvalue
    return p_value


# Função para o Teste de Template Matching Não-Overlapping
def non_overlapping_template_matching_test(numbers, template):
    template_length = len(template)
    matches = sum(
        1
        for i in range(len(numbers) - template_length + 1)
        if numbers[i : i + template_length] == template
    )
    p_value = binomtest(
        matches, len(numbers) - template_length + 1, 1 / (2**template_length)
    ).pvalue
    return p_value


# Função para o Teste de Template Matching Overlapping
def overlapping_template_matching_test(numbers, template):
    template_length = len(template)
    matches = sum(
        1
        for i in range(len(numbers) - template_length + 1)
        if numbers[i : i + template_length] == template
    )
    p_value = binomtest(matches, len(numbers), 1 / (2**template_length)).pvalue
    return p_value


# Função para o Teste Universal de Maurer
def maurer_universal_test(numbers):
    L = 7
    Q = 1280
    K = len(numbers) // L - Q
    T = [0] * (2**L)
    for i in range(Q):
        T[int("".join(map(str, numbers[i * L : (i + 1) * L])), 2)] = i + 1
    sum_ = 0
    for i in range(Q, Q + K):
        V = int("".join(map(str, numbers[i * L : (i + 1) * L])), 2)
        sum_ += np.log2(i + 1 - T[V])
        T[V] = i + 1
    fn = sum_ / K
    c = 0.7 - 0.8 / L + (4 + 32 / L) * (K ** (-3 / L)) / 15
    sigma = c * np.sqrt(0.832 * L + 0.6)
    p_value = norm.cdf((fn - 7.1836656) / sigma)
    return p_value


# Função para o Teste de Complexidade Linear
def linear_complexity_test(numbers, block_size):
    blocks = [numbers[i : i + block_size] for i in range(0, len(numbers), block_size)]
    complexities = [berlekamp_massey(block) for block in blocks]
    mean = (
        block_size / 2
        + (9 + (-1) ** (block_size + 1)) / 36
        - (block_size / 3 + 2 / 9) / 2**block_size
    )
    T = [
        (complexity - mean) / np.sqrt(block_size / 2 * (1 - 2 / 9))
        for complexity in complexities
    ]
    p_value = chisquare(T).pvalue
    return p_value


def berlekamp_massey(bits):
    n = len(bits)
    c = [0] * n
    b = [0] * n
    c[0] = 1
    b[0] = 1
    l = 0
    m = -1
    for i in range(n):
        discrepancy = bits[i]
        for j in range(1, l + 1):
            discrepancy ^= c[j] & bits[i - j]
        if discrepancy:
            t = c[:]
            for j in range(n - i + m):
                c[i - m + j] ^= b[j]
            if l <= i // 2:
                l = i + 1 - l
                m = i
                b = t
    return l


# Função para o Teste Serial
def serial_test(numbers, block_size):
    blocks = [numbers[i : i + block_size] for i in range(0, len(numbers), block_size)]
    counts = [sum(block) for block in blocks]
    p_value = chisquare(counts).pvalue
    return p_value


# Função para o Teste de Entropia Aproximada
def approximate_entropy_test(numbers, block_size):
    blocks = [numbers[i : i + block_size] for i in range(0, len(numbers), block_size)]
    counts = [sum(block) for block in blocks]
    phi_m = sum(np.log(count / len(blocks)) for count in counts) / len(blocks)
    phi_m_plus_1 = sum(np.log((count + 1) / len(blocks)) for count in counts) / len(
        blocks
    )
    ap_en = phi_m - phi_m_plus_1
    p_value = 1 - norm.cdf(ap_en)
    return p_value


# Função para o Teste de Somas Cumulativas
def cumulative_sums_test(numbers):
    cumulative_sums = np.cumsum(2 * np.array(numbers) - 1)
    p_value = kstest(cumulative_sums, "norm").pvalue
    return p_value


# Função para o Teste de Excursões Aleatórias
def random_excursions_test(numbers):
    cumulative_sums = np.cumsum(2 * np.array(numbers) - 1)
    unique_states = set(cumulative_sums)
    p_values = []
    for state in unique_states:
        count = sum(cumulative_sums == state)
        p_value = chisquare([count, len(numbers) - count]).pvalue
        p_values.append(p_value)
    return p_values


# Função para o Teste de Excursões Aleatórias Variante
def random_excursions_variant_test(numbers):
    cumulative_sums = np.cumsum(2 * np.array(numbers) - 1)
    unique_states = set(cumulative_sums)
    p_values = []
    for state in unique_states:
        count = sum(cumulative_sums == state)
        p_value = chisquare([count, len(numbers) - count]).pvalue
        p_values.append(p_value)
    return p_values


print("Frequency Monobit Test p-value:", frequency_monobit_test(random_numbers))
print(
    "Longest Runs of Ones Test p-value:", longest_runs_of_ones_test(random_numbers, 100)
)
print(
    "Non-Overlapping Template Matching Test p-value:",
    non_overlapping_template_matching_test(random_numbers, [1, 0, 1]),
)
print(
    "Overlapping Template Matching Test p-value:",
    overlapping_template_matching_test(random_numbers, [1, 0, 1]),
)
print(
    "Maurer's Universal Statistical Test p-value:",
    maurer_universal_test(random_numbers),
)
print("Linear Complexity Test p-value:", linear_complexity_test(random_numbers, 100))
print("Serial Test p-value:", serial_test(random_numbers, 100))
print(
    "Approximate Entropy Test p-value:", approximate_entropy_test(random_numbers, 100)
)
