import { PostgrestError } from "@supabase/supabase-js"
import { NotificationEnums } from "../enums/notificationEnums"
import supabaseClient from "../supabase/client"
import { NotificationsType } from "../types/notificationTypeDefinitions"
import { RelationshipType } from "../types/userTypeDefinitions"

export async function addKidRequestNotification(sender_id: string, receiver_id: string, kid_id: string) {
    const notificationData: Omit<NotificationsType, 'id'> = {
        sender_id: sender_id,
        receiver_id: receiver_id,
        kid_id: kid_id,
        notification_type: NotificationEnums.addKidRequest
    }
    try {
        const { data, error } = await supabaseClient
            .from('Notifications')
            .insert(notificationData)
            .select()
        if (error) {
            throw handleSupabaseError(error)
        }
        return data
    } catch (error) {
        console.log(error)
    }
}

export async function approveAddKidRequest({ new_parent_id, sender_id, kid_id }: { new_parent_id: string, sender_id: string, kid_id: string }) {
    const notificationData: Omit<NotificationsType, 'id'> = {
        sender_id: sender_id,
        receiver_id: new_parent_id,
        kid_id: kid_id,
        notification_type: NotificationEnums.approveKidRequest
    }
    try {
        const newRelationshipData = {
            relationship: 'parent',
            kid_id: kid_id,
            adult_id: new_parent_id
        }
        const { data: newRelationship, error: newRelationshipError }: { data: RelationshipType | null; error: PostgrestError | null } = await supabaseClient
            .from('adult_kid')
            .insert(newRelationshipData)
            .single()
        if (newRelationshipError) {
            throw handleSupabaseError(newRelationshipError)
        }

        const { data, error } = await supabaseClient
            .from('Notifications')
            .insert(notificationData)
            .select()
        if (error) {
            throw handleSupabaseError(error)
        }
        return data
    } catch (error) {
        console.log(error)
    }
}

export async function deleteNotification(notification_id: string) {
    try {
        const { data, error } = await supabaseClient
            .from('Notifications')
            .delete()
            .eq('id', notification_id)
            .select()
        if (error) {
            throw handleSupabaseError(error)
        }
        return data
    } catch (error) {
        console.log(error)
    }
}

export async function denyAddKidRequest({ receiver_id, sender_id, kid_id }: { receiver_id: string, sender_id: string, kid_id: string }) {
    const notificationData: Omit<NotificationsType, 'id'> = {
        sender_id: sender_id,
        receiver_id: receiver_id,
        kid_id: kid_id,
        notification_type: NotificationEnums.denyKidRequest
    }
    try {
        const { data, error } = await supabaseClient
            .from('Notifications')
            .insert(notificationData)
            .select()
        if (error) {
            throw handleSupabaseError(error)
        }
        return data
    } catch (error) {
        console.log(error)
    }
}

function handleSupabaseError(error: PostgrestError): Error {
    const { message, details } = error;
    console.error("Error adding notification:", message, details);
    // Handle specific error codes (e.g., display user-friendly messages):
    switch (error.code) {
        case "42701": // Unique constraint violation (e.g., duplicate entry)
            return new Error("A notification already exists.");
        case "42P01": // Missing required field
            return new Error("Please fill in all required fields.");
        default:
            // Handle other potential errors with generic or custom error messages
            return new Error("An error occurred while adding the notification.");
    }
}