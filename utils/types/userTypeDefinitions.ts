import { NotificationsType } from "./notificationTypeDefinitions";

export type NewUserType = {
  first_name: string | undefined;
  last_name: string | undefined;
  email: string | null;
  profilePicURL: string | null | undefined;
  firebase_uid: string;
};

export type AdultsType = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  email: string;
  emergency_contact?: string;
  profilePicURL: string | null | undefined;
  show_phone_number: boolean;
  show_email: boolean;
  firebase_uid: string;
  Adult_Kid?: AdultKidRelationshipType[];
  Kids?: KidsType[];
  Notifications?: NotificationsType[];
};

export type AdultKidRelationshipType = {
  id: string;
  adult_id: string;
  kid_id: string;
  relationship: string;
};

export type KidsType = {
  id: string;
  first_name: string;
  last_name: string;
  birthday?: string;
  first_name_only: boolean;
  primary_caregiver: string;
  profile_pic?: string;
};

export type RelationshipType = {
  relationship: string;
  kid_id: string;
  adult_id: string;
};

export type FriendGroupType = {
  id: string;
  group_name: string;
  kid_owner: string;
  friend_group_members: FriendGroupMembersType[]
}

export type FriendGroupMembersType = {
  kid_id: string;
  primary_caregiver_id: string;
  profile_pic?: string;
  first_name_only: boolean;
  first_name: string;
  last_name: string;
}

export type SupabaseFriendGroupMemberType = {
  kid_uid: string;
  Kids: {
    primary_caregiver: string | null;
    profile_pic?: string;
    first_name_only: boolean;
    first_name: string;
    last_name: string;
  };
};
