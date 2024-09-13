import React from 'react'

export default function Custom404() {
  return (
    <div className="lg:px-24 lg:py-24 md:py-20 md:px-44 px-4 py-24 items-center flex justify-center flex-col-reverse lg:flex-row md:gap-28 gap-16 bg-gray-50 dark:bg-gray-900">
    <div className="xl:pt-24 w-full xl:w-1/2 relative pb-12 lg:pb-0">
        <div className="relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h1 className="my-2 text-gray-900 dark:text-gray-100 font-bold text-2xl">
                    Looks like you've found the doorway to the great nothing
                </h1>
                <p className="my-2 text-gray-700 dark:text-gray-300">Sorry about that! Please visit our homepage to get where you need to go.</p>
                <button className="sm:w-full lg:w-auto my-2 border rounded md py-4 px-8 text-center bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-700 dark:focus:ring-indigo-400 focus:ring-opacity-50">
                    Take me there!
                </button>
            </div>
            <div className="relative mt-6">
                <img src="https://i.ibb.co/G9DC8S0/404-2.png" alt="404 Error Image" />
            </div>
        </div>
    </div>
    <div className="relative mt-6 lg:mt-0">
        <img src="https://i.ibb.co/ck1SGFJ/Group.png" alt="Illustration Image" />
    </div>
</div>

    
  )
}
