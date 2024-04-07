import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from pandas.tseries.offsets import MonthBegin, Week

def generateFutureRevenueData(requestData, frequency='month'):
    if len(requestData) == 0: 
        return []
    
    if frequency not in ['month', 'week']:
        return []
    
    data = []
    for revData in requestData:
        data.append({
            'period': revData['period'],
            'total_revenue': revData['total_revenue'],
            'total_sold': revData['total_sold']
        })

    df = pd.DataFrame(data)
    
    # Adjusted part for handling different frequencies
    if frequency == 'month':
        df['period'] = pd.to_datetime(df['period'], format='%Y-%m')
    elif frequency == 'week':
        # Assuming weekly data might be in a 'YYYY-WW' format
        df['period'] = pd.to_datetime(df['period'] + '-1', format='%Y-%W-%w')

    # Feature Engineering
    df['month'] = df['period'].dt.month
    df['year'] = df['period'].dt.year
    df['sin_month'] = np.sin(2 * np.pi * df['month'] / 12)
    df['cos_month'] = np.cos(2 * np.pi * df['month'] / 12)

    # Optionally, add dummy variables for specific months
    for i in range(1, 13):
        df[f'month_{i}'] = (df['month'] == i).astype(int)

    # Prepare data for Random Forest
    X = df.drop(['period', 'total_revenue', 'total_sold'], axis=1)
    y = df['total_revenue']

    # Train the Random Forest model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)

    # Define future periods based on the specified frequency
    if frequency == 'month':
        future_periods = pd.date_range(df['period'].max() + pd.offsets.MonthBegin(), periods=12, freq='M')
    elif frequency == 'week':
        future_periods = pd.date_range(df['period'].max() + pd.offsets.Week(), periods=52, freq='W')

    future_df = pd.DataFrame(future_periods, columns=['period'])
    future_df['month'] = future_df['period'].dt.month
    future_df['year'] = future_df['period'].dt.year
    future_df['sin_month'] = np.sin(2 * np.pi * future_df['month'] / 12)
    future_df['cos_month'] = np.cos(2 * np.pi * future_df['month'] / 12)

    # Add dummy variables for future data
    for i in range(1, 13):
        future_df[f'month_{i}'] = (future_df['month'] == i).astype(int)

    future_revenues = model.predict(future_df.drop(['period'], axis=1))
    return {
        'future_revenues': future_revenues.tolist(),
        'frequency': frequency
    }