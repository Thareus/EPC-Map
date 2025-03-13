import pandas as pd

epc_bristol = pd.read_csv(r"domestic-E06000023-Bristol-City-of\certificates.csv", dtype=str)
uprn = pd.read_csv(r"osopenuprn_202502.csv", dtype=str)

epc_bristol['UPRN'] = epc_bristol['UPRN'].str.zfill(10)

uprn['UPRN'] = uprn['UPRN'].str.zfill(10)

uprn = uprn[uprn['UPRN'].isin(epc_bristol['UPRN'])]

uprn_bristol = pd.merge(epc_bristol, uprn, on='UPRN', how='inner')

uprn_bristol.to_csv('Bristol.csv', index=False)