def slugify(dataframe, *columns, limit=200):
    """
    Adapts the official slugify function from Django performed on a given set of columns in a dataframe.
    Returns a slug column.
    """
    slug_column = dataframe[[*columns]].apply(lambda row: ' '.join(
        [i for i in row.astype(str).values if i != 'nan']
    ), axis=1)
    slug_column = slug_column.str.lower()
    slug_column = slug_column.str.replace(r'[^\w\s-]', '', regex=True)
    slug_column = slug_column.str.replace(r'[-\s]+', '-', regex=True)
    slug_column = slug_column.str.strip('-_')
    slug_column = slug_column.str.slice(0, limit)
    return slug_column

def utc_to_datetime_column(column):
    """
    :param column: Column of particularly formatted datetime stamps from Neetrix.
    Converts the column to datetime and localises it to London, then converting to tz-naive
    :return:
    """
    from datetime import datetime
    column = column.str.replace("Z", "+00:00")
    column = column.apply(lambda x: datetime.fromisoformat(x))
    column = column.dt.tz_convert(tz='Europe/London')
    column = column.dt.tz_localize(None)
    return column

def rgb_to_hex(r, g, b):
    return '#{:02x}{:02x}{:02x}'.format(r, g, b)