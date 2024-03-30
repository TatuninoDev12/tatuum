'use client'
import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from './ui/use-toast'

const MeetingTypeList = () => {

    const router = useRouter()
    const [meeting, setMeeting] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>()
    const [values, setvalues] = useState({
        dateTime: new Date(),
        description: '',
        link: ''
    })
    const [callDetails, setCallDetails] = useState<Call>()
    const { toast } = useToast()
    const { user } = useUser()
    const client = useStreamVideoClient()

    const createMeeting = async () => {
        if (!client || !user) return
        try {

            if (!values.dateTime) {
                toast({
                    title: 'Please select a date and time',
                })
                return
            }

            const id = crypto.randomUUID()
            const call = client.call('default', id)

            if (!call) throw new Error('Failed to create call')

            const startAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString()
            const description = values.description || 'Instant Meeting'

            await call.getOrCreate({
                data: {
                    starts_at: startAt,
                    custom: {
                        description
                    }
                }
            })

            setCallDetails(call)
            if (!values.description) {
                router.push(`/meeting/${id}`)
            }
            toast({
                title: 'Meeting Created',
            })
        } catch (error) {
            toast({
                title: 'Failed to create meeting',
            })
        }
    }

    return (
        <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4'>
            <HomeCard
                img='/icons/add-meeting.svg'
                title='New Meeting'
                description='Start an instant meeting'
                handleClick={() => setMeeting('isInstantMeeting')}
                className='bg-orange-1'
            />
            <HomeCard
                img='/icons/schedule.svg'
                title='Schedule Meeting'
                description='Plan your meeting'
                handleClick={() => setMeeting('isScheduleMeeting')}
                className='bg-blue-1'
            />
            <HomeCard
                img='/icons/recordings.svg'
                title='View Recordings'
                description='Check out your recordings'
                handleClick={() => router.push('/recordings')}
                className='bg-purple-1'
            />
            <HomeCard
                img='/icons/join-meeting.svg'
                title='Join Meeting'
                description='Via meeting link'
                handleClick={() => setMeeting('isJoiningMeeting')}
                className='bg-yellow-1'
            />
            <MeetingModal
                isOpen={meeting === 'isInstantMeeting'}
                onClose={() => setMeeting(undefined)}
                title='Start an instant meeting'
                className='text-center'
                buttonText='Start Meeting'
                handleClick={createMeeting}
            />
        </section>
    )
}

export default MeetingTypeList