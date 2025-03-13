from tqdm import tqdm
import sqlalchemy.orm
import pandas as pd
import numpy as np
import sqlalchemy as s
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.inspection import inspect
from sqlalchemy.orm import Session
from utils import slugify

class EPC_Map_Database:
    def __init__(self):
        self.engine = None
        self.create_connection_to_database()

    def announce(function):
        def wrapped_function(*args, **kwargs):
            print(function.__name__)
            return function(*args, **kwargs)
        return wrapped_function

    ## CONNECTION ##
    def create_connection_to_database(self):
        self.automap = automap_base()
        self.engine = s.create_engine(
            s.engine.url.URL.create(
                drivername="postgresql+psycopg2",
                username='admin',
                password='password',
                host='localhost',
                port=5433,
                database='epc_map_database',
            ),
        )
        self.automap.prepare(autoload_with=self.engine)
        self.metadata = s.MetaData()
        self.metadata.reflect(self.engine)
        self.session = Session(self.engine)
        self.connection = self.engine.connect()

    ## SCHEMA ##
    def get_schema(self, table):
        """
        Returns a dictionary of the names of the columns and their datatypes, of a given table.
        """
        # schema = [field['name'] for field in s.inspect(self.engine).get_columns(table)]
        # Both of these statements work but the second is more consistent with other methods.
        table = s.Table(table, self.metadata, autoload=True, autoload_with=self.engine)
        return {column_name: str(info.type) for column_name, info in table.columns.items()}

    def get_all_schema(self):
        """
        Retreives the schema for all the tables in the database and saves these as schema.
        :return: schema
        """
        if not hasattr(self, 'tables'):
            self.get_all_table_names()
        self.all_schema = list(map(getattr(self, f'_get_schema_{self.database_type}'), self.table_names))
        self.all_schema = {table: self.all_schema[index] for index, table in enumerate(self.table_names)}
        return self.all_schema

    ## TABLE NAMES ##
    def get_all_table_names(self):
        """
        Obtains the table names for each user-created table in a django/postgresql database
        :returns:
        """
        self.table_names = self.engine.table_names()
        return self.table_names

    ## PRIMARY KEY ##
    def get_primary_key(self, table):
        # primary_key = table.primary_key.columns.values()[0].name
        table = self.get_table_object(table)
        primary_key = inspect(table).primary_key.columns.values()[0].name
        return primary_key

    ## TABLE OBJECTS ##
    def get_table_object(self, table):
        return self.metadata.tables[table]

    ## TABLES ##
    def get_table_as_dataframe(self, table):
        """
        Obtains the entire table from the database and returns it as a dataframe.
        :param table: the name of the table in the database
        :return: The table data as a pandas dataframe
        """
        return pd.read_sql_table(table, self.engine)

    def get_table_as_dataframe(self, table_name):
        """
        Obtains the entire table from the database and sets it as an attribute in the form of a dataframe,
        so that similar operations do not need to request the table each time.
        This attribute must be deleted if this data needs to be refreshed. Returns the dataframe.
        :param table: the name of the table in the database
        :return: The table data as a pandas dataframe
        """
        while True:
            try:
                return getattr(self, f'table_{table_name}_as_dataframe')
            except AttributeError:
                table = getattr(self, f'_get_table_as_dataframe_{self.database_type}')(table_name)
                setattr(self, f'table_{table_name}_as_dataframe', table)

    ## COLUMN ##
    def get_column_as_series(self, column, table_name):
        return pd.read_sql_query(f'SELECT {column} FROM "{table_name}"', con=self.engine)[column]

    ## COLUMNS ##
    def get_columns_as_dataframe(self, columns, table_name):
        columns = (', ').join(columns)
        return pd.read_sql_query(f'SELECT {columns} FROM "{table_name}"', con=self.engine)

    ## OBJECT
    def get_object_by_primary_key(self, table_name, pk):
        primary_key = self.get_primary_key(table_name)
        return pd.read_sql_query(
            f'SELECT * FROM "{table_name}" WHERE {primary_key} = \'{pk}\';',
            con=self.engine
        )

    ## OBJECT LIST ##
    def get_object_list_by_primary_key(self, table_name, primary_key_list):
        primary_key = self.get_primary_key(table_name)
        primary_keys = tuple(set(primary_key_list))
        return pd.read_sql_query(
            f'SELECT * FROM "{table_name}" WHERE {primary_key} IN {primary_keys}',
            con=self.engine
        )

    ## DELETE TABLE ##
    def delete_all_data_from_table(self, table):
        """Will not work if there are dependent relationships"""
        self.connection.execute(sqlalchemy.text(f'TRUNCATE TABLE "{table}";'))

    ## DELETE SELECTED ROWS ##
    def delete_data_from_table(self, table, primary_key_list):
        primary_key = self.get_primary_key(table)
        step = 10000
        for split_list in [primary_key_list[start:start + step] for start in range(0, len(primary_key_list), step)]:
            self.connection.execute(sqlalchemy.text(f'DELETE FROM "{table}" WHERE {primary_key} IN {tuple(split_list)};'))

    ## TABLE COUNT ##
    def get_table_count(self, table):
        """
        Simply returns the length of the table in the database.
        :param table:
        """
        self.get_table_object()
        table_object = s.Table(table, self.metadata, autoload=True, autoload_with=self.engine)
        count = s.select([s.func.count()]).select_from(table_object)
        count = self.connection.execute(count).scalar()
        return count

    ## TABLE METHODS
    def get_table_not_null_columns(self, table):
        inspector = s.inspect(self.engine)
        columns = inspector.get_columns(table)
        not_null_columns = [column['name'] for column in columns if column['nullable']==False]
        return not_null_columns

    @staticmethod
    def get_common_columns(df1, df2):
        return list(
            set(df1.columns.tolist())
            & set(df2.columns.tolist())
        )

    def compare_schema(self, dataframe, table, ignore_missing_columns=False):
        """
        Compares the dataframe schema to the django model fields.
        :param dataframe: A pandas dataframe
        :param table: A table corresponding to a Django model.
        :param ignore_missing_columns: A boolean value indicating whether it is safe to return a partial object.
        :return:
        """
        try:
            table_columns = self.get_schema(table)
        except KeyError:
            raise KeyError(f"{table} not found as a table in database schema.")
        extra_dataframe_columns = [column for column in dataframe.columns if column not in table_columns]
        extra_table_columns = [column for column in table_columns if column not in dataframe.columns]

        if ignore_missing_columns and not extra_dataframe_columns:
            return True

        if extra_dataframe_columns and extra_table_columns:
            print(f"Columns in {table} dataframe: {extra_dataframe_columns}, are not in the database table. "
                  f"Either remove these columns or update the model. In addition, matching columns "
                  f"in the dataframe for these model fields: {extra_table_columns} cannot be found. "
                  f"Update the column names if these columns are present.")
        elif extra_dataframe_columns and not extra_table_columns:
            print(f"Columns in {table} dataframe: {extra_dataframe_columns}, "
                  f"are not in the database table. Either remove these columns or update the model.")
        elif extra_table_columns and not extra_dataframe_columns:
            print(f"Cannot find matching columns in the {table} dataframe for these fields: {extra_table_columns}")
        return extra_dataframe_columns, extra_table_columns


    def compare_dataframe_with_table(self, table, dataframe):
        """
        Function will attempt to bring the dataframe and database table into
        a comparable state by reducing both to common columns and indexes.
        Dataframes must have identical shape to compare.
        Will return a comparison dataframe if possible.
        :param dataframe:
        :param table:
        """
        database_table = self.get_table_as_dataframe(table)
        primary_key = self.get_primary_key(table)
        # Obtain columns in common and slice both dataframes to consist of only these columns
        # Then set the primary key as the index.
        common_columns = self.get_common_columns(dataframe, database_table)
        dataframe = dataframe[common_columns].set_index(primary_key)
        database_table = database_table[common_columns].set_index(primary_key)
        # Set common columns to be the same data type.
        # Data types need to be identical to prevent false positive during dataframe.compare
        for column in common_columns:
            if column in database_table and database_table[column].dtype == 'float64':
                dataframe[column] = dataframe[column].astype(float).round(2)
                database_table[column] = database_table[column].round(2)
            elif column in database_table and database_table[column].dtype == 'int64': # May be redundant
                dataframe[column] = dataframe[column].astype(int)
                database_table[column] = database_table[column].astype(int)
            else:
                pass

        # The intersection of the primary_key/index ensures that only pre-existing and thus updateable entries are included.
        common_index = set(dataframe.index.intersection(database_table.index).tolist())
        dataframe = dataframe.loc[common_index]
        dataframe = dataframe[~dataframe.index.duplicated(keep='first')]
        dataframe = dataframe.sort_index(inplace=False)
        database_table = database_table.loc[common_index]
        database_table = database_table.sort_index(inplace=False)
        comparison_dataframe = dataframe.compare(database_table, keep_shape=False, keep_equal=False)
        return comparison_dataframe

    ### COMMON PREPARATION FUNCTIONS ###
    def get_model_content_type_id(self, model):
        contenttypes = self.get_table_as_dataframe('django_content_type')
        return contenttypes[contenttypes['model']==model.lower()].squeeze()['id']

    @staticmethod
    def join_string_columns(dataframe, columns:list, target_column:str):
        dataframe[target_column] = dataframe[columns].apply(lambda row: ', '.join([i for i in row.values.astype(str) if i != 'nan']), axis=1)
        return dataframe

    @staticmethod
    def convert_column_names(dataframe):
        """
        Converts dataframe columns into the columns of the schema.
        Columns must be almost identical already, allowing for human readability.
        :param dataframe:
        """
        dataframe.columns = dataframe.columns.str.lower().str.replace(" ", "_")
        return dataframe

    @staticmethod
    def check_column_lengths(dataframe):
        """
        As columns have max lengths, this function will return the length of the
        largest string in each column to see if any data is over this limit.
        """
        for column in dataframe.columns:
            print(column, dataframe[column].astype(str).str.len().max())

    def fill_string_column_null_values(self, table_name, table_dataframe):
        """
        Using the table schema from the database, will fill the empty values in all string columns with ''
        :param table_name: the name of the table in the database.
        :param table_dataframe: a dataframe that should extracted directly from the database.
        """
        schema = self.get_schema(table_name)
        string_columns = [key for key in schema.keys() if 'CHAR' in schema[key]]
        for column in string_columns:
            table_dataframe[column].fillna('', inplace=True)
        return table_dataframe

    @staticmethod
    def convert_date_columns(dataframe, columns=None):
        if not columns:
            columns = [column for column in dataframe.columns if 'date' in column.lower()]
        for column in columns:
            dataframe[column] = pd.to_datetime(dataframe[column], dayfirst=True, format="%d/%m/%Y", errors='coerce').dt.strftime("%Y-%m-%d")
        return dataframe

    @staticmethod
    def remove_nan(dictionaries):
        """
        Iterates through list of dictionaries and delete empty keys from each
        dictionary as these will cause problems if data is being send to an API
        """
        for dictionary in dictionaries:
            empty_keys = []
            for key, value in dictionary.items():
                if pd.isna(value):
                    empty_keys.append(key)  # To avoid Runtime Error, a seperate dictionary must be constructed.
            for key in empty_keys:
                dictionary.pop(key)
        return dictionaries

    def handle_not_null_columns(self, table, dataframe):
        table_not_null_columns = self.get_table_not_null_columns(table)
        dataframe_null_columns = [column for column in dataframe.columns[dataframe.isna().any()].tolist()
                                  if column in table_not_null_columns]
        if dataframe_null_columns:
            raise ValueError(f"The dataframe has missing values in these columns: {dataframe_null_columns}")

        dataframe_null_columns.extend([column for column in table_not_null_columns if column not in dataframe.columns])

        if 'id' in dataframe_null_columns:
            dataframe['id'] = [value + 1 for value in dataframe.index.values]

        # Remake dataframe_null_columns to see what remains
        dataframe_null_columns = [column for column in table_not_null_columns if column not in dataframe.columns]
        if dataframe_null_columns:
            raise KeyError(f"The dataframe has columns which require values: {', '.join(dataframe_null_columns)}")
        else:
            return dataframe

    def update_table_through_bulk_update_mappings(self, table_name, dataframe):
        """
        Will update database table values with values from a dataframe, after
        these are compared and reduced to only different values
        :param table_name: The database table name
        :param dataframe: A pandas dataframe that contains the updated values.
        """
        comparison_dataframe = self.compare_dataframe_with_table(table_name, dataframe)
        # Filtering out rows with no changes.
        subset_list = [(col, level) for col, level in comparison_dataframe.columns if level in ['self', 'other']]
        comparison_dataframe = comparison_dataframe.dropna(how='all', subset=subset_list)
        if comparison_dataframe.empty: # Dataframes have no differences.
            print("NO DIFFERENCES")
            return
        updated_values = comparison_dataframe.loc[:, (slice(None), 'self')] # 'self' is dataframe
        primary_key = comparison_dataframe.index.name

        updated_values.columns = [value[0] for value in updated_values.columns]
        updated_values.index = comparison_dataframe.index
        updated_values[primary_key] = updated_values.index
        mapper = getattr(self.automap.classes, table_name)

        print(f"Updating {len(updated_values)} items in {table_name}")
        mappings = []
        updated_values.apply(lambda x: mappings.append(x.dropna().to_dict()), axis=1)

        def split_mappings(mappings):
            step = 10000
            return [mappings[start:start+step] for start in range(0, len(mappings), step)]

        for map_step in tqdm(split_mappings(mappings)):
            self.session.bulk_update_mappings(mapper, map_step)
            self.session.flush()
            self.session.commit()

    def get_new_objects(self, table, dataframe):
        """
        Determines what is new data from a dataframe to be inserted into the corresponding table in the
        database if that data is not found. DOES NOT determine what data has been modified, only new objects.
        :param table: The name of the table in the database
        :param dataframe: The dataframe containing corresponding data.
        :return:
        """
        # Select only new items
        primary_key = self.get_primary_key(table)
        # Set primary key as string
        dataframe[primary_key] = dataframe[primary_key].astype(str)
        table_data = self.get_column_as_series(primary_key, table).astype(str)

        new_objects = dataframe[~dataframe[primary_key].isin(table_data)]
        print(f"Adding {len(new_objects)} new objects to the database {table} table")
        # Compare dataframe with table to identify missing columns or values
        extra_dataframe_columns, extra_table_columns = self.compare_schema(new_objects, table, False)
        new_objects.drop(columns=extra_dataframe_columns, inplace=True)
        for column in extra_table_columns:
            new_objects.insert(len(new_objects.columns), column, value=None, allow_duplicates=False)
        not_null_columns = self.get_table_not_null_columns(table)

        columns_needing_info = list(set(extra_table_columns) & set(not_null_columns))
        if columns_needing_info:
            raise ValueError(f"These columns: {columns_needing_info} -- are not nullable and need values")
        new_objects = new_objects.drop_duplicates(subset=primary_key, keep='first')
        return new_objects

    def batch_add(self, table, new_objects):
        # Split large dataframe into subframes to help identify location of errors in uploading
        subframes = [pd.DataFrame(i) for i in np.array_split(new_objects, 100)]
        for subframe in tqdm(subframes):
            subframe.to_sql(table, con=self.engine, if_exists='append', chunksize=10000, index=False)

    def add_new_certificates(self, file):
        certificates = pd.read_csv(file, dtype=str)
        certificates = self.convert_column_names(certificates)
        certificates.rename(columns={
            'environment_impact_current':'environmental_impact_current',
            'environment_impact_potential':'environmental_impact_potential',
        }, inplace=True)
        certificates.drop(columns=['x_coordinate', 'y_coordinate'], inplace=True)
        certificates = certificates.round({'floor_height': 2})
        certificates['lodgement_datetime'] = pd.to_datetime(certificates['lodgement_datetime'], format='ISO8601')
        new_certificates = self.get_new_objects('map_certificate', certificates)
        self.batch_add('map_certificate', new_certificates)

if __name__ == '__main__':
    db = EPC_Map_Database()