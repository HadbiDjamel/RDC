import pandas as pd
import numpy as np

# Standard populations (IARC/WHO)
WORLD_STANDARD = {
    '0-4': 12000, '5-9': 10000, '10-14': 9000, '15-19': 9000,
    '20-24': 8000, '25-29': 8000, '30-34': 6000, '35-39': 6000,
    '40-44': 6000, '45-49': 6000, '50-54': 5000, '55-59': 4000,
    '60-64': 4000, '65-69': 3000, '70-74': 2000, '75-79': 1000,
    '80-84': 500, '85+': 500
}

def calculate_crude_rate(cases, population):
    """
    Calculate crude rate per 100,000
    """
    if population == 0:
        return 0
    return (cases / population) * 100000

def calculate_asr(age_specific_cases, age_specific_pop, standard_pop=WORLD_STANDARD):
    """
    Calculate Age-Standardized Rate (ASR) per 100,000
    age_specific_cases: Dict { '0-4': count, ... }
    age_specific_pop: Dict { '0-4': count, ... }
    """
    asr_sum = 0
    total_std_pop = sum(standard_pop.values())
    
    for age_group in standard_pop:
        cases = age_specific_cases.get(age_group, 0)
        pop = age_specific_pop.get(age_group, 0)
        std_weight = standard_pop[age_group]
        
        if pop > 0:
            rate = cases / pop
            asr_sum += (rate * std_weight)
            
    return (asr_sum / total_std_pop) * 100000

def get_age_group(age):
    if age < 5: return '0-4'
    if age < 10: return '5-9'
    if age < 15: return '10-14'
    if age < 20: return '15-19'
    if age < 25: return '20-24'
    if age < 30: return '25-29'
    if age < 35: return '30-34'
    if age < 40: return '35-39'
    if age < 45: return '40-44'
    if age < 50: return '45-49'
    if age < 55: return '50-54'
    if age < 60: return '55-59'
    if age < 65: return '60-64'
    if age < 70: return '65-69'
    if age < 75: return '70-74'
    if age < 80: return '75-79'
    if age < 85: return '80-84'
    return '85+'
