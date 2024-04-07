import { useStreamVideoClient } from "@stream-io/video-react-sdk"
import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"

interface CreateCallProps {
    personal?: boolean
    description?: string
    date?: Date
}

export const useCreateCall = ({ personal = false, description = '', date }: CreateCallProps) => {
    const client = useStreamVideoClient()
    const { user } = useUser()
    const startAt = date?.toISOString() || new Date(Date.now()).toISOString()
    const id = crypto.randomUUID()
    const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${id}${personal ? '?personal=true' : ''}`

    const newCall = client?.call('default', id)

    useEffect(() => {
        const loadCalls = async () => {
            if (!client || !user) return

            try {
                await newCall?.getOrCreate({
                    data: {
                        starts_at: startAt,
                        members: [{ user_id: user.id, role: 'admin' }],
                        custom: {
                            description
                        }
                    }
                })
            } catch (error) {
                console.log(error);

            }



        }
        loadCalls()
    }, [client, user?.id])

    return {
        meetingLink,
        id
    }
}