from itertools import groupby

import mysql.connector
import numpy as np
import pandas as pd
from scipy.stats import binom_test, chisquare, kstest, norm

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="7355608",
    database="games",
)

query = "SELECT * FROM beacon_results"
df = pd.read_sql(query, conn)


# Função para o Teste de Frequência (Monobit)
def frequency_monobit_test(numbers):
    n = len(numbers)
    s = sum(numbers)
    p_value = binom_test(s, n, 0.5)
    return p_value


# Função para o Teste de Frequência em Blocos
def frequency_block_test(numbers, block_size):
    blocks = [numbers[i : i + block_size] for i in range(0, len(numbers), block_size)]
    p_values = [binom_test(sum(block), len(block), 0.5) for block in blocks]
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


# Função para o Teste de Rank de Matrizes Binárias
def binary_matrix_rank_test(numbers, matrix_size):
    matrices = [
        np.reshape(numbers[i : i + matrix_size**2], (matrix_size, matrix_size))
        for i in range(0, len(numbers), matrix_size**2)
    ]
    ranks = [np.linalg.matrix_rank(matrix) for matrix in matrices]
    p_value = chisquare(ranks).pvalue
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
    p_value = binom_test(
        matches, len(numbers) - template_length + 1, 1 / (2**template_length)
    )
    return p_value


# Função para o Teste de Template Matching Overlapping
def overlapping_template_matching_test(numbers, template):
    template_length = len(template)
    matches = sum(
        1
        for i in range(len(numbers) - template_length + 1)
        if numbers[i : i + template_length] == template
    )
    p_value = binom_test(matches, len(numbers), 1 / (2**template_length))
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


random_numbers = df["random_numbers"].tolist()
print("Frequency Monobit Test p-value:", frequency_monobit_test(random_numbers))
print("Frequency Block Test p-values:", frequency_block_test(random_numbers, 100))
print("Runs Test p-value:", runs_test(random_numbers))
print(
    "Longest Runs of Ones Test p-value:", longest_runs_of_ones_test(random_numbers, 100)
)
print("Binary Matrix Rank Test p-value:", binary_matrix_rank_test(random_numbers, 32))
print(
    "Discrete Fourier Transform Test p-value:",
    discrete_fourier_transform_test(random_numbers),
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
print("Cumulative Sums Test p-value:", cumulative_sums_test(random_numbers))
print("Random Excursions Test p-values:", random_excursions_test(random_numbers))
print(
    "Random Excursions Variant Test p-values:",
    random_excursions_variant_test(random_numbers),
)
