import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: './csm_db.sqlite3',
    driver: sqlite3.Database,  
  });
}
