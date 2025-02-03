from itertools import groupby

import numpy as np
import pandas as pd
from scipy.stats import binomtest, chisquare, norm
from sqlalchemy import create_engine

# Configurar a conexão com o banco de dados usando SQLAlchemy
engine1 = create_engine("mysql+mysqlconnector://root:7355608@192.168.217.147/beacon")

# Executar consultas SQL e carregar os dados em DataFrames do pandas
query1 = "SELECT * FROM nist_randomness"
query2 = "SELECT * FROM beacon_results"
df1 = pd.read_sql(query1, engine1)
df2 = pd.read_sql(query2, engine1)


# Função para converter valores hexadecimais para binário
def hex_to_binary(hex_string):
    """Converte uma string hexadecimal em uma lista de bits binários."""
    return [int(bit) for bit in bin(int(hex_string, 16))[2:].zfill(len(hex_string) * 4)]


# Função para dividir um DataFrame em 4 partes
def split_dataframe(df, num_parts=4):
    """Divide um DataFrame em um número especificado de partes."""
    return np.array_split(df, num_parts)


# Função para aplicar os testes em uma lista de números
def apply_tests(numbers):
    """Aplica uma série de testes de aleatoriedade em uma lista de números binários."""
    results = {}
    results["Frequency Monobit Test"] = frequency_monobit_test(numbers)
    results["Longest Runs of Ones Test"] = longest_runs_of_ones_test(numbers, 100)
    results["Non-Overlapping Template Matching Test"] = (
        non_overlapping_template_matching_test(numbers, [1, 0, 1])
    )
    results["Overlapping Template Matching Test"] = overlapping_template_matching_test(
        numbers, [1, 0, 1]
    )
    results["Maurer's Universal Statistical Test"] = maurer_universal_test(numbers)
    results["Linear Complexity Test"] = linear_complexity_test(numbers, 100)
    results["Serial Test"] = serial_test(numbers, 100)
    results["Approximate Entropy Test"] = approximate_entropy_test(numbers, 100)
    return results


# Função para o Teste de Frequência (Monobit)
def frequency_monobit_test(numbers):
    """Teste de Frequência (Monobit) para verificar a proporção de 0s e 1s."""
    n = len(numbers)
    s = sum(numbers)
    p_value = binomtest(s, n, 0.5).pvalue
    return p_value


# Função para o Teste de Longest Runs of Ones in a Block
def longest_runs_of_ones_test(numbers, block_size):
    """Teste de Longest Runs of Ones em blocos de tamanho especificado."""
    blocks = [numbers[i : i + block_size] for i in range(0, len(numbers), block_size)]
    longest_runs = [
        max(len(list(g)) for k, g in groupby(block) if k == 1) for block in blocks
    ]
    p_value = chisquare(longest_runs).pvalue
    return p_value


# Função para o Teste de Template Matching Não-Overlapping
def non_overlapping_template_matching_test(numbers, template):
    """Teste de Template Matching Não-Overlapping."""
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
    """Teste de Template Matching Overlapping."""
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
    """Teste Universal de Maurer para avaliar a compressibilidade da sequência."""
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
    """Teste de Complexidade Linear usando o algoritmo de Berlekamp-Massey."""
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


# Algoritmo de Berlekamp-Massey para calcular a complexidade linear
def berlekamp_massey(bits):
    """Implementação do algoritmo de Berlekamp-Massey para calcular a complexidade linear."""
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
    """Teste Serial para verificar a uniformidade das sequências."""
    blocks = [numbers[i : i + block_size] for i in range(0, len(numbers), block_size)]
    counts = [sum(block) for block in blocks]
    p_value = chisquare(counts).pvalue
    return p_value


# Função para o Teste de Entropia Aproximada
def approximate_entropy_test(numbers, block_size):
    """Teste de Entropia Aproximada para medir a complexidade da sequência."""
    blocks = [numbers[i : i + block_size] for i in range(0, len(numbers), block_size)]
    counts = [sum(block) for block in blocks]
    phi_m = sum(np.log(count / len(blocks)) for count in counts) / len(blocks)
    phi_m_plus_1 = sum(np.log((count + 1) / len(blocks)) for count in counts) / len(
        blocks
    )
    ap_en = phi_m - phi_m_plus_1
    p_value = 1 - norm.cdf(ap_en)
    return p_value


# Função para processar um DataFrame, dividir em partes e aplicar os testes
def process_and_test_dataframe(df, df_name):
    """Processa um DataFrame, divide em partes e aplica os testes de aleatoriedade."""
    # Converter a coluna 'randomness' de hexadecimal para binário
    random_numbers = []
    for hex_value in df["randomness"]:
        random_numbers.extend(hex_to_binary(hex_value))

    # Dividir os números binários em 4 partes
    parts = split_dataframe(pd.DataFrame(random_numbers), num_parts=4)

    # Aplicar os testes em cada parte e armazenar os resultados
    results = []
    for i, part in enumerate(parts):
        part_name = f"Part {i+1}"
        part_size = len(part)
        part_results = apply_tests(part[0].tolist())
        part_results["Part"] = part_name
        part_results["Size"] = part_size
        results.append(part_results)

    # Criar um DataFrame com os resultados
    results_df = pd.DataFrame(results)
    results_df.set_index("Part", inplace=True)

    return results_df


# Processar e testar cada DataFrame
df1_results = process_and_test_dataframe(df1, "df1")
df2_results = process_and_test_dataframe(df2, "df2")
df1_results = df1_results.T
df2_results = df2_results.T
df1_results["Average"] = df1_results.mean(axis=1)
df2_results["Average"] = df2_results.mean(axis=1)
df1_results["Std Dev"] = df1_results.iloc[:, :-1].std(axis=1)
df2_results["Std Dev"] = df2_results.iloc[:, :-1].std(axis=1)
df1_results = df1_results.round(3)
df2_results = df2_results.round(3)

# Exibir os resultados
print(df1.count())
print(df2.count())
print("Resultados para NIST Beacon:")
print(df1_results)

print("\nResultados para Local Beacon:")
print(df2_results)

df1_results.to_csv("df1_results.csv")
df2_results.to_csv("df2_results.csv")
