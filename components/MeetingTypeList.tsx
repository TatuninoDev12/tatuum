'use client'
import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from './ui/use-toast'
import { Textarea } from './ui/textarea'
import ReactDatePicker from 'react-datepicker'
import Loader from './Loader'
import { Input } from './ui/input'

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
                router.push(`/meeting/${call.id}`)
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

    if (!client || !user) return <Loader />;

    const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`

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

            {!callDetails ? (
                <MeetingModal
                    isOpen={meeting === 'isScheduleMeeting'}
                    onClose={() => setMeeting(undefined)}
                    title='Create a meeting'
                    handleClick={createMeeting}
                >
                    <div className='flex flex-col gap-2.5'>
                        <label className='text-base text-normal leading-[22px] text-sky-2'>
                            Add a description
                        </label>
                        <Textarea className='border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none' onChange={(e) => { setvalues({ ...values, description: e.target.value }) }} />
                    </div>
                    <div className='flex w-full flex-col gap-2.5'>
                        <label className='text-base text-normal leading-[22px] text-sky-2'>
                            Select Date and Time
                        </label>
                        <ReactDatePicker
                            selected={values.dateTime}
                            onChange={(date) => setvalues({ ...values, dateTime: date! })}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            timeCaption='time'
                            dateFormat="MMMM d, yyyy h:mm aa"
                            className='w-full rounded bg-dark-3 p-2 focus:outline-none'
                        />
                    </div>
                </MeetingModal>

            ) : (
                <MeetingModal
                    isOpen={meeting === 'isScheduleMeeting'}
                    onClose={() => setMeeting(undefined)}
                    title='Meeting Created'
                    handleClick={() => {
                        navigator.clipboard.writeText(meetingLink)
                        toast({ title: 'Meeting link copied to clipboard' })
                    }}
                    image={'/icons/checked.svg'}
                    buttonIcon='/icons/copy.svg'
                    buttonText='Copy Meeting Link'
                    className='text-center'
                />

            )}
            <MeetingModal
                isOpen={meeting === 'isJoiningMeeting'}
                onClose={() => setMeeting(undefined)}
                title='Start an instant meeting'
                className='text-center'
                buttonText='Start Meeting'
                handleClick={() => router.push(values.link)}
            >
                <Input placeholder='Meeting link' onChange={(e) => setvalues({ ...values, link: e.target.value })} className='border-none bg-dark-3 focus-visible:ring-o focus-visible:ring-offset-0' />
            </MeetingModal>
            <MeetingModal
                isOpen={meeting === 'isInstantMeeting'}
                onClose={() => setMeeting(undefined)}
                title='Type the link here'
                className='text-center'
                buttonText='Join Meeting'
                handleClick={createMeeting}
            />
        </section>
    )
}

export default MeetingTypeList