
import { createClient } from '@libsql/client';

const client = createClient({
    url: 'file:packages/database/sqlite.db'
});

async function main() {
    try {
        const rs = await client.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders'");
        console.log("Table Definition:");
        console.log(rs.rows[0].sql);
    } catch (e) {
        console.error(e);
    }
}

main();
