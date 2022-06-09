import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Fragment, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline'
import { ITweet } from '../../types/tweet';
import { IQuery } from '../../types/query';
import { IArchivedQuery } from '../../types/archivedQuery';
import { Disclosure, Menu } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';

function DeleteQueryButton({ callback }: { callback: () => void }) {
  return <button
    type="button"
    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
    onClick={callback}
  >
    Delete
  </button>
}

const navigation = [
  { name: 'Dashboard', href: '/', current: false },
  { name: 'Archive', href: '/archive/archive', current: true },
  { name: 'Public Queries', href: '/archive/public-queries', current: false },
]

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}


function SubmitQueryPublic({ callback }: { callback: () => void }) {
      return <button
        type="button"
        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
        onClick={callback}
      >
        Submit
      </button>
  }

const Archive : NextPage = () => {
    let [archivedQueries, setArchivedQueries] = useState<IArchivedQuery[] | undefined>(undefined);
    let [tweets, setTweets] = useState<ITweet[] | undefined>(undefined);
    let [modalQuery, setModalQuery] = useState<IQuery | undefined>(undefined);
    let [open, setOpen] = useState(false);
    let [queryPublic, setQueryPublic] = useState(false)

    const [refreshKey, setRefreshKey] = useState(0);
    const cancelButtonRef = useRef(null);

  useEffect(() => {
      axios(`${process.env.NEXT_PUBLIC_API_URL}/queries/archive/list`).then(res => {
        if (res.data.status === 200) {
          let queriesList: IArchivedQuery[] = [];
          for (let query of res.data['queries']) {
            queriesList.push({
              id: query['_id'],
              name: query['name'],
              location: query['location'],
              startDate: parseISO(query['startDate']),
              endDate: parseISO(query['endDate']),
              keywords: query['keywords'],
              frequency: query['frequency'],
              maxTweets: query['maxTweets'],
              isPublic: query['isPublic']
            });
          }
          setArchivedQueries(queriesList);
        }
        else setArchivedQueries(undefined);
      }).catch(err => {
        console.log(err);
      });
  }, [refreshKey]);
      

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setOpen}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              >
               <Dialog.Overlay className="fixed inset-0 bg-stone-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
             >
              <div className="inline-block align-bottom bg-stone-50 dark:bg-stone-700 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-stone-50 dark:bg-stone-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-700 sm:mx-0 sm:h-10 sm:w-10">
                      <QuestionMarkCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-200" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left" >
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900 dark:text-stone-100">
                        <span className='font-bold'>Query</span> <span className='italic break-normal'>{modalQuery?.name}</span>
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-stone-300">
                        Deleting the query means you will lose all access to the tweet data from the website and all of the query data will be deleted.
                        Making the query public will allow external access of the query and its attached twitter data.
                        </p>
                      </div>
                      <label 
                        className = "block text-sm font-medium my-2 text-gray-100">
                        <input
                            className = "w-5 h-5 mx-2 align-text-bottom border-gray-300 rounded-md border bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                            type = "checkbox"
                            checked = {queryPublic}
                            onChange = {() => setQueryPublic(!queryPublic)}
                          />
                        Make Query Public?
                      </label>
                    </div>
                  </div>
                </div>
                <div className="bg-stone-100 dark:bg-stone-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <SubmitQueryPublic callback = {
                    () => {
                    setOpen(false)
                    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/query/archive/${modalQuery?.id}/public?isPublic=${queryPublic}`, {}).then(res => {
                      if (res.data['status'] === 200) {
                        console.log('Query updated');
                        setRefreshKey((prev) => prev + 1);
                      }
                    }).catch(err => {
                      console.log('Query update failed');
                    });
                    }
                  }></SubmitQueryPublic>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-stone-400 shadow-sm px-4 py-2 bg-white dark:bg-stone-200 text-base font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                    setOpen(false);
                    }}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                  <Link href={`/archive/${modalQuery?.id}`} passHref>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-stone-400 shadow-sm px-4 py-2 bg-white dark:bg-stone-200 text-base font-medium text-gray-700 hover:bg-gray-50 dark:hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      View
                    </button>
                  </Link>
                  <DeleteQueryButton callback= {
                    () => {
                      setOpen(false);
                      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/query/archive/${modalQuery?.id}/remove`, {}).then(res => {
                        if (res.data['status'] === 200) {
                          console.log('Query removed');
                          setRefreshKey((prev) => prev + 1);
                        }
                      }).catch(err => {
                        console.log('Query remove failed');
                      });
                    }
                  }></DeleteQueryButton>
                </div>      
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      <div className="h-screen bg-white dark:bg-stone-900">
        <Head>
          <title>T16 - Dashboard</title>
          <meta name="description" content="Dashboard for NTP use" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Disclosure as="nav" className="bg-gray-800">
          {({ open }) => (
            <>
              <div className="max-w-13xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                  <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    {/* Mobile menu button*/}
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                  <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                    <div className="flex-shrink-0 flex items-center">
                      <img
                        className="block lg:hidden h-8 w-auto"
                        src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
                        alt="Workflow"
                      />
                      <img
                        className="hidden lg:block h-8 w-auto"
                        src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg"
                        alt="Workflow"
                      />
                    </div>
                    <div className="hidden sm:block sm:ml-6">
                      <div className="flex space-x-4">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                              'px-3 py-2 rounded-md text-sm font-medium'
                            )}
                            aria-current={item.current ? 'page' : undefined}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    {/* Removed Notification Menu */}
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'block px-3 py-2 rounded-md text-base font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <main className="p-2 grid overflow-hidden grid-cols-4 grid-rows-5 gap-2">
          <div className="row-span-4 col-span-4 min-w-full min-h-full overflow-hidden">
            <h1 className="m-2 font-bold text-xl md:text-xl xl:text-4xl dark:text-white">Active Queries</h1>
            <div className='overflow-y-auto ' style={{ height: '80vh' }}>
              {archivedQueries && archivedQueries.map((query, index) => {
                return (
                  <button key={index} onClick={() => {
                    setModalQuery(query);
                    setOpen(true);
                    setQueryPublic(query['isPublic']);
                  }} className="block m-3 p-6 text-left bg-white rounded-lg border border-stone-200 shadow-md hover:bg-stone-100 dark:bg-stone-800 dark:border-stone-700 dark:hover:bg-stone-700">
                    <h5 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">{query.name}</h5>
                    <h5 className="mb-2 text-l tracking-tight text-stone-900 dark:text-stone-200">{format(query.startDate, 'yyyy/MM/dd')} to {format(query.endDate, 'yyyy/MM/dd')}</h5>
                    <p className="font-normal text-stone-700 dark:text-stone-400"><span className='font-bold'>Keywords: </span>{query.keywords.toLocaleString().replaceAll(',', ', ')}</p>
                    <p className="font-normal text-stone-700 dark:text-stone-400"><span className='font-bold'>Frequency: </span><span className='italic'>{query.frequency}</span> min</p>
                    <p className="font-normal text-stone-700 dark:text-stone-400"><span className='font-bold'>Max Tweets: </span><span className='italic'>{query.maxTweets}</span></p>
                  </button>
                );
              })}
            </div>
          </div>
          {/* <div className="row-span-2 min-w-full min-h-full">
            <h1 className="m-2 font-bold text-xl md:text-xl xl:text-4xl dark:text-white">Top 5 Tweets</h1>
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
          </div> */}
          <div className="min-w-full min-h-full p-2 flex flex-col justify-center items-center">
            {/* Possible Transition Buttons */}
          </div>
        </main>
      </div>
    </>
  )
}

export default Archive