import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { QueryMap } from '../../components/map';
import TagInput from '../../components/tagInput';
import { format } from 'date-fns';
import axios from 'axios';
import { useRouter } from 'next/router';

const NewQuery: NextPage = () => {

    let [name, setName] = useState('');
    let [radius, setRadius] = useState(50);
    let [startDate, setStartDate] = useState(format(Date.now(), 'yyyy-MM-dd'));
    let [endDate, setEndDate] = useState(format(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd'));
    let [frequency, setFrequency] = useState(30);
    let [maxTweets, setMaxTweets] = useState(100);
    let [keywords, setKeywords] = useState([
        'storm', 
        'tornado', 
        'twister', 
        '@weathernetwork', 
        '@NTP_Reports', 
        'funnel cloud', 
        'tornado warning', 
        'hurricane'
    ] as string[]);
    let [location, setLocation] = useState({
		longitude: -79.347,
		latitude: 43.651,
	});

    const map = <QueryMap 
        location={location}
        onMove={(loc) => {
            setLocation(loc);
        }} style={{ width: '100%', height: '90vh' }}
    />;

    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const keywordsString = keywords.map((keyword, index) => {
            return encodeURIComponent(keyword);
        }).toString();

        console.log(keywordsString);

        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/query/new?name=${encodeURIComponent(name)}&loc=${location.latitude},${location.longitude},${radius}km&start=${startDate}&end=${endDate}&freq=${frequency}&max=${maxTweets}&keywords=${keywordsString}`).then(
            res => {
                if (res.data['status'] === 200) {
                    console.log('success');
                    router.push('/');
                }
            }
        ).catch(err => {
            console.log(err);
        });
    }
    
    const keywordInput = <TagInput 
        tags={keywords}
        setTags={(tags) => {
            setKeywords(tags);
        }}
    />

    useEffect(() => {} , [keywords]);

    return (
        <>
            <Head>
                <title>T16 - New Query</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <body className="h-screen bg-white dark:bg-stone-900">
                <main className="p-2 grid overflow-hidden grid-cols-5 grid-rows-5 gap-2">
                    <div className="row-span-5 col-span-3">
                        <h1 className="font-bold text-xl md:text-xl xl:text-4xl dark:text-white">New Query</h1>
                        <div className='mt-2'>
                            {map}
                        </div>
                    </div>
                    <div className="row-span-4 col-span-2 min-w-full min-h-full overflow-hidden">
                        <form id="newQueryForm" onSubmit={handleSubmit} onKeyDown={(e) => {
                            return e.key != 'Enter';
                        }} className="mt-9 ml-3 mr-3">
                            <label className="block text-lg font-bold dark:text-white">Query Name</label>
                            <input className="m-2 w-full appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-stone-100" value={name} onKeyDown={(e) => {
                                return e.key != 'Enter';
                            }} onChange={(e) => {
                                setName(e.target.value);
                            }} type="text" id="name" placeholder="London, ON - 2021/06/07"></input>
                            <label className="block text-lg font-bold dark:text-white">Radius (km)</label>
                            <input className="m-2 w-full appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-stone-100" value={radius} onKeyDown={(e) => {
                                return e.key != 'Enter';
                            }} onChange={(e) => {
                                setRadius(parseInt(e.target.value));
                            }} type="number" id="radius" placeholder="50"></input>
                            <label className="block text-lg font-bold dark:text-white">Duration</label>
                            <div className="flex flex-wrap -mx-3 mb-2">
                                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                    <label className="block text-sm font-bold dark:text-white">Start</label>
                                    <input className="m-2 w-full appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-stone-100" value={startDate} onKeyDown={(e) => {
                                        return e.key != 'Enter';
                                    }} onChange={(e) => {
                                        setStartDate(e.target.value);
                                    }} type="date" id="startDate"></input>
                                </div>
                                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                    <label className="block text-sm font-bold dark:text-white">End</label>
                                    <input className="m-2 w-full appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-stone-100" value={endDate} onKeyDown={(e) => {
                                        return e.key != 'Enter';
                                    }} onChange={(e) => {
                                        setEndDate(e.target.value);
                                    }} type="date" id="endDate"></input>
                                </div>
                            </div>
                            <label className="block text-lg font-bold dark:text-white">Keywords</label>
                            {keywordInput}
                            <span className='ml-2 text-stone-400 italic select-none'>Add #(Province)Storm e.g. #ONStorm</span>
                            <label className="block text-lg font-bold dark:text-white">Frequency (min)</label>
                            <input className="m-2 w-full appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-stone-100" value={frequency} onKeyDown={(e) => {
                                return e.key != 'Enter';
                            }} onChange={(e) => {
                                setFrequency(parseInt(e.target.value));
                            }} type="number" id="frequency" placeholder="30"></input>
                            <label className="block text-lg font-bold dark:text-white">Max Tweets</label>
                            <input className="mt-2 ml-2 mr-2 w-full appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-stone-100" value={maxTweets} onKeyDown={(e) => {
                                return e.key != 'Enter';
                            }} onChange={(e) => {
                                setMaxTweets(parseInt(e.target.value));
                            }} type="number" min="10" max="250" id="maxTweets" placeholder="100"></input>
                            <span className='ml-2 text-stone-400 italic select-none'>10 to 250 Tweets per check</span>
                        </form>
                    </div>
                    <div className="min-w-full col-span-2 min-h-full p-2 flex flex-col justify-end items-center">
                        <button form="newQueryForm" value="Submit" className="w-full px-3 py-2 my-2 text-center rounded-md border-2 border-stone-700 bg-stone-600 hover:bg-stone-500 dark:border-stone-400 dark:bg-stone-300 dark:hover:bg-stone-200 shadow-sm text-sm leading-5 font-semibold text-stone-100 dark:text-stone-900">Submit</button>
                    </div>
                </main>
            </body>
        </>
    )
}

export default NewQuery