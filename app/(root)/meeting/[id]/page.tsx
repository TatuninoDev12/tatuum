'use client'
import Loader from '@/components/Loader'
import MeetingRoom from '@/components/MeetingRoom'
import MeetingSetup from '@/components/MeetingSetup'
import { useGetCallById } from '@/hook/useGetCallById'
import { useUser } from '@clerk/nextjs'
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk'
import { useState } from 'react'

const Meeting = ({ params: { id } }: { params: { id: string } }) => {
    const { user, isLoaded } = useUser()
    const [isSetupComplet, setIsSetupcomplet] = useState(false)
    const { call, isCallLoading } = useGetCallById(id)

    if (!isLoaded || isCallLoading) return <Loader />

    return (
        <main className='h-screen w-full'>
            <StreamCall call={call}>
                <StreamTheme>
                    {!isSetupComplet ? (
                        <MeetingSetup setIsSetupcomplet={setIsSetupcomplet} />
                    ) : (
                        <MeetingRoom />
                    )}
                </StreamTheme>
            </StreamCall>
        </main>
    )
}

export default Meeting