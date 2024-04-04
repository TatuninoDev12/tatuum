
'use client'
import { cn } from '@/lib/utils'
import { CallControls, CallParticipantsList, CallStatsButton, CallingState, PaginatedGridLayout, SpeakerLayout, useCallStateHooks, useCall, name } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutList, Users } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import EndCallButton from './EndCallButton'
import Loader from './Loader'
import { useUser } from '@clerk/nextjs'

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right'

const mem: string[] = []
let countParticipants = 0
const MeetingRoom = () => {
    const searchParams = useSearchParams()
    const [layout, setLayout] = useState<CallLayoutType>('speaker-left')
    const [showParticipantes, setshowParticipantes] = useState(false)
    const isPersonalRoom = !!searchParams.get('personal')
    const router = useRouter()
    const { user } = useUser()

    const { useParticipants, } = useCallStateHooks();
    const participants = useParticipants({ sortBy: name });

    const call = useCall()


    useEffect(() => {
        const update = async () => {

            if (!call) return

            const members = call.state.members.map((member) => {
                return member.user_id
            })

            members?.map((member) => {
                participants.map((participant) => {
                    if (participant.userId !== user?.id && mem.indexOf(member) === -1) {

                        mem.push(participant.userId)
                        countParticipants++
                    }
                })

            })


            if (mem.length === countParticipants && countParticipants > 0) {
                call.updateCallMembers({
                    update_members: mem.map((participant) => {
                        return { user_id: participant }
                    })
                })
                countParticipants = 0
            }
        }

        update()

    }, [participants, call?.state.members, user?.id, call])

    const { useCallCallingState } = useCallStateHooks()
    const callingState = useCallCallingState()


    if (callingState !== CallingState.JOINED) return <Loader />

    const CallLayout = () => {
        switch (layout) {
            case 'grid':
                return <PaginatedGridLayout />
            case 'speaker-right':
                return <SpeakerLayout participantsBarPosition="left" />
            case 'speaker-left':
                return <SpeakerLayout participantsBarPosition="right" />
            default:
                return <SpeakerLayout participantsBarPosition="right" />
        }
    }
    return (
        <section className='relative h-screen w-full overflow-hidden pt-4 text-white'>
            <div className='relative flex size-full items-center justify-center'>
                <div className='flex size-full max-w-[1000px] items-center'>
                    <CallLayout />
                </div>
                <div className={cn('h-[calc(100vh-86px)] hidden ml-2', { 'show-block': showParticipantes })}>
                    <CallParticipantsList onClose={() => setshowParticipantes(false)} />
                </div>
            </div>
            <div className='fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap'>
                <CallControls onLeave={() => { router.push('/') }} />

                <DropdownMenu>
                    <div className='flex items-center'>
                        <DropdownMenuTrigger className='cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]'>
                            <LayoutList size={20} className='text-white' />
                        </DropdownMenuTrigger>

                    </div>
                    <DropdownMenuContent className='border-dark-1 bg-dark-1 text-white'>
                        {
                            ['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
                                <div key={index}>
                                    <DropdownMenuItem className='cursor-pointer' onClick={() => {
                                        setLayout(item.toLowerCase() as CallLayoutType)
                                    }}>
                                        {item}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className='border-dark-1' />
                                </div>
                            ))
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
                <CallStatsButton />
                <button onClick={() => setshowParticipantes((prev) => !prev)}>
                    <div className='cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]'>
                        <Users size={20} className='text-white' />
                    </div>
                </button>
                {/* {!isPersonalRoom && <EndCallButton />} */}
                <EndCallButton />
            </div>
        </section>
    )
}

export default MeetingRoom