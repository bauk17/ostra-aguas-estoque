use std::sync::{MutexGuard};

use rusqlite::Connection;

use crate::database::connection::DbState;

pub struct Repository;

impl Repository {

    pub fn conn(
        db: &DbState,
    ) -> MutexGuard<'_, Connection> {

        db.conn.lock().unwrap()
    }

}