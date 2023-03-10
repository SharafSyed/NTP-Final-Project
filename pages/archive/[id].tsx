import axios from 'axios';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { IArchivedQuery } from '../../types/archivedQuery';
import { QueryHeatmap } from '../../components/map';
import { ITweet } from '../../types/tweet';
import { CSVLink } from 'react-csv';
import Link from 'next/link';

const ArchivedQuery: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;

    let [tweets, setTweets] = useState<ITweet[] | undefined>(undefined);
    let [query, setQuery] = useState<IArchivedQuery | undefined>(undefined);
    let [csvTweets, setCsvTweets] = useState<{tweetId: string, content: string, likes: string, retweets: string,replies: string, mediaCount: string, createdAt: string, longitude: string, latitude: string, keywordCount: string, relatabilityScore: string, link: string}[]>([]);

    useEffect(() => {
        axios(`${process.env.NEXT_PUBLIC_API_URL}/query/archive/${id}`).then(res => {
            if (res.data.status === 200) {
                setQuery({
                    id: res.data.query['_id'],
                    name: res.data.query['name'],
                    location: res.data.query['location'],
                    startDate: parseISO(res.data.query['startDate']),
                    endDate: parseISO(res.data.query['endDate']),
                    keywords: res.data.query['keywords'],
                    frequency: res.data.query['frequency'],
                    maxTweets: res.data.query['maxTweets'],
                    isPublic:  res.data.query['isPublic']
                });
            }
            else setQuery(undefined);
        }).catch(err => {
            console.log(err);
            setQuery(undefined);
        });
        axios(`${process.env.NEXT_PUBLIC_API_URL}/query/archive/${id}/tweets?limit=10`).then(res => {
            if (res.data.status === 200) {
                let tweetsList: ITweet[] = [];
                for (let query of res.data['tweets']) {
                    tweetsList.push({
                        id: query['id'],
                        queryID: query['qId'],
                        likes: query['likes'],
                        retweets: query['rt'],
                        replies: query['rp'],
                        media: query['media'],
                        createdAt: parseISO(query['date']),
                        location: query['loc'],
                        content: query['content'],
                        keywordCount: query['kc'],
                        interactionScore: query['is'],
                        relatabilityScore: query['rs']
                    });
                }
                setTweets(tweetsList);
            }
            else setTweets(undefined);
        }).catch(err => {
            console.log(err);
        });

        axios(`${process.env.NEXT_PUBLIC_API_URL}/query/archive/${id}/tweets?limit=0`).then(res => {
            if (res.data.status === 200) {
                let tweetsList: ITweet[] = [];
                for (let query of res.data['tweets']) {
                    tweetsList.push({
                        id: query['id'],
                        queryID: query['qId'],
                        likes: query['likes'],
                        retweets: query['rt'],
                        replies: query['rp'],
                        media: query['media'],
                        createdAt: parseISO(query['date']),
                        location: query['loc'],
                        content: query['content'],
                        keywordCount: query['kc'],
                        interactionScore: query['is'],
                        relatabilityScore: query['rs']
                    });
                }

                setCsvTweets(tweetsList.map((a)=> {
                    return {tweetId: a.id, content: a.content, likes: a.likes.toString(), retweets: a.retweets.toString(), mediaCount: a.media.length.toString(), replies: a.replies.toString(), createdAt: format(a.createdAt, 'yyyy/MM/dd'), longitude: a.location.coordinates[0].toString(), latitude: a.location.coordinates[1].toString(), keywordCount: a.keywordCount.toString(), relatabilityScore: a.relatabilityScore.toString(), link:`https://twitter.com/anyuser/status/${a.id}` }
                }));
            }
            else setCsvTweets([]);
        }).catch(err => {
            console.log(err);
        });
    }, [id]);

    return (
        <>
            <Head>
                <title>T16 - Dashboard</title>
                <meta name="description" content="Dashboard for NTP use" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className='h-full bg-white dark:bg-stone-900'>
                <main className="p-2 grid overflow-hidden grid-cols-4 grid-rows-5 gap-2">
                    <div className="row-span-5 col-span-3">
                        <h1 className="font-bold text-xl md:text-xl xl:text-4xl dark:text-white">{query?.name}</h1>
                        <div className='mt-2 rounded-md'>
                            <QueryHeatmap id={id as string} />
                        </div>
                    </div>
                    <div className="row-span-3 min-w-full min-h-full overflow-hidden">
                        <h1 className="m-2 font-bold text-xl md:text-xl xl:text-4xl dark:text-white">Quick View</h1>
                        <div className='overflow-y-auto' style={{ height: '50vh' }}>
                            {tweets && tweets.map((tweet, index) => {
                                return (
                                    <div key={index} className="block m-3 p-6 bg-white rounded-lg border border-stone-200 shadow-md dark:bg-stone-800 dark:border-stone-700">
                                        <div className="m-2">
                                            {tweet.media && tweet.media.length > 0 && tweet.media.map((media, index) => {
                                                if (media.type === 'video') {
                                                    return (
                                                        <><video key={index} className="rounded-md" controls>
                                                            <source src={media.url} type="video/mp4" />
                                                        </video>
                                                        <span className='font-bold'>Link: </span><span className='italic'><a target='_blank' href={`https://twitter.com/anyuser/status/${tweet.id}`} rel='noopener noreferrer' className='text-blue-400 hover:text-blue-300'>Twitter</a></span></>

                                                    );
                                                }
                                                else if (media.type === 'photo') {
                                                    return (
                                                        <>
                                                        <img key={index} className="rounded m-2" src={media.url} alt="media" />
                                                        <span className='font-bold'>Link: </span><span className='italic'><a target='_blank' href={`https://twitter.com/anyuser/status/${tweet.id}`} rel='noopener noreferrer' className='text-blue-400 hover:text-blue-300'>Twitter</a></span>
                                                        </>
                                                    );
                                                }
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="row-span-2 min-w-full min-h-full">
                        <h1 className="m-2 font-bold text-xl md:text-xl xl:text-4xl dark:text-white">Top 10 Tweets</h1>
                        <div className='overflow-y-auto' style={{ height: '30vh' }}>
                            {tweets && tweets.map((tweet, index) => {
                                return (
                                    <div key={index} className="block m-3 p-6 bg-white rounded-lg border border-stone-200 shadow-md dark:bg-stone-800 dark:border-stone-700">
                                        <h5 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white break-words">Tweet: {tweet.id}</h5>
                                        <h5 className="mb-2 text-l tracking-tight text-stone-900 dark:text-stone-200">{format(tweet.createdAt, 'yyyy/MM/dd')} - {tweet.relatabilityScore.toFixed(2)} score</h5>
                                        <p className="font-normal text-stone-700 dark:text-stone-400"><span className='font-bold'>Likes: </span>{tweet.likes}</p>
                                        <p className="font-normal text-stone-700 dark:text-stone-400"><span className='font-bold'>Matches: </span><span className='italic'>{tweet.keywordCount}</span> keywords matched</p>
                                        <p className="font-normal text-stone-700 dark:text-stone-400"><span className='font-bold'>Media: </span><span className='italic'>{tweet.media.length}</span> pieces of content</p>
                                        <p className="font-normal text-stone-700 dark:text-stone-400"><span className='font-bold'>Link: </span><span className='italic'><a target='_blank' href={`https://twitter.com/anyuser/status/${tweet.id}`} rel='noopener noreferrer' className='text-blue-400 hover:text-blue-300'>Twitter</a></span></p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="min-w-full min-h-full p-2 flex flex-col justify-end items-end col-span-4" > 
                        <CSVLink
                            data = {csvTweets}
                            headers = {[
                                {label: "ID", key: "tweetId" }, {label: "Content", key: "content"}, {label:"Likes", key: "likes" }, {label: "Retweets", key: "retweets" }, {label: "Replies", key: "replies" }, {label: "Media Count", key: "mediaCount" }, {label: "Date", key: "createdAt" }, {label: "Longitude", key: "longitude" }, {label: "Latitude", key: "latitude"}, {label: "Keyword Count", key: "keywordCount" }, {label: "Relatability Score",  key: "relatabilityScore" }, {label: "Link", key: "link"}
                            ]}
                            filename = {query?.name + " - " + query?.id + ".csv"}
                        >
                            <a className="w-full px-3 py-2 my-2 text-center rounded-md border-2 border-stone-700 bg-stone-600 hover:bg-stone-500 dark:border-stone-400 dark:bg-stone-300 dark:hover:bg-stone-200 shadow-sm text-sm leading-5 font-semibold text-stone-100 dark:text-stone-900">Download Me</a>
                        </CSVLink>

                        <Link 
                        href = {'../archive/archive'} passHref
                        >   
                        <button className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-stone-400 shadow-sm px-4 py-2 bg-white dark:bg-stone-200 text-base font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                            Back
                        </button>    
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
}

export default ArchivedQuery