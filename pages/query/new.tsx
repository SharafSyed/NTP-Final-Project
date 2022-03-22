import type { NextPage } from 'next';
import Head from 'next/head';
import { NewQueryMap } from '../../components/map';

const NewQuery: NextPage = () => {

    let location = {};

    const map = <NewQueryMap onMove={(loc) => {
        location = loc;
    }} />;

    return (
        <div className="p-8">
            <Head>
                <title>T16 - New Query</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="min-h-screen p-16 flex flex-1 flex-col justify-center items-center">
                <h1 className="text-2xl font-bold">New Query Page</h1>
                {map}
            </main>
        </div>
    )
}

export default NewQuery