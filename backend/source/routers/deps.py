"""
Deps router - Shared dependencies and constants for all routers.
"""

import psycopg2.extras

# Shorthand for RealDictCursor — used in every router that queries the DB.
# Declared once here to avoid repeating the import and alias in each file.
DICT_CURSOR = psycopg2.extras.RealDictCursor