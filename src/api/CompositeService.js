import { CompositeService } from './index'

export const Composite = {
    deleteFriend: (uuid, token) => CompositeService("POST", "/friends.delete", {friendUuid: uuid}, token),
    unBlockFriend: (friend, token) => CompositeService("POST", "/friends.unblock", {friendUuid: friend.uuid, channelId: friend.channelId}, token),
    blockFriend: (friend, token) => CompositeService("POST", "/friends.block", {friendUuid: friend.uuid, channelId: friend.channelId}, token),
    acceptFriend: (uuid, token) => CompositeService("POST", "/friends.accept", {friendUuid: uuid}, token),
    addFriend: (uuid, token) => CompositeService("POST", "/friends.add-friends", {friendUuid: uuid}, token),
    searchFriendByUsername: (username, token) => CompositeService("GET", `/friends.find-by-username?username=${username}`, null, token),
    getBlockFriends: (token) => CompositeService("GET", "/friends.find?friendType=block", null, token),
    getMyFriends: (token) => CompositeService("GET", "/friends.find?friendType=accept", null, token),
    getFriendRequest: (token) => CompositeService("GET", "/friends.request", null, token),
    getMyProfile: (token) => CompositeService("GET", "/users.profile", null, token),
    SignInWithEmail: (data) => CompositeService("POST", "/users.signin.email", data),
}