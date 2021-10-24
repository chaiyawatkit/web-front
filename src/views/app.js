import React, { useState } from 'react'
import { Composite } from '../api/CompositeService'
import RefreshIcon from '../assets/refresh'
import {Client as Chat} from 'twilio-chat/lib'

function App({username="", password=""}) {
	const [accessToken, setAccessToken] = useState(null)
	const [twilioToken, setTwilioToken] = useState(null)
	const [userProfile, setUserProfile] = useState(null)
	const [loadingAddFriend, setLoadingAddFriend] = useState(false)
	const [friendRequest, setFriendRequest] = useState([])
	const [myFriends, setMyFriends] = useState([])
	const [blockFriends, setBlockFriends] = useState([])
	const [searchFriends, setSearchFriends] = useState(null)
	const [twilioClient, setTwilioClient] = useState(null)
	const [channelList, setChannelList] = useState(null)
	const [chatMessage, setChatMessage] = useState(null)
	const [channelSelected, setChannelSelected] = useState(null)

	const handleSibmit = async (e) => {
		e.preventDefault()
		const email  = e.target[0].value
		const password = e.target[1].value
		const userSignin = await Composite.SignInWithEmail({accountName: email, password: password})
		if (userSignin.status === 200) {
			let t = userSignin.data.data.accessToken
			let twilioAccessToken = userSignin.data.data.twilioAccessToken
			setAccessToken(t)
			setTwilioToken(twilioAccessToken)
			getUserProfile(t)
			getFriendRequest(t)
			getMyFriends(t)
			getBlockFriends(t)
		}

	}

	const getUserProfile = async (t) => {
		const userProfile = await Composite.getMyProfile(t)
		if (userProfile.status === 200) {
			setUserProfile(userProfile.data.data)
		}
	}

	const getFriendRequest = async (t) => {
		const friends = await Composite.getFriendRequest(t)
		if (friends.status === 200) {
			setFriendRequest(friends.data.data)
		}
	}

	const getMyFriends = async (t) => {
		const friends = await Composite.getMyFriends(t)
		if (friends.status === 200) {
			setMyFriends(friends.data.data? friends.data.data : [])
		}
	}

	const getBlockFriends = async (t) => {
		const friends = await Composite.getBlockFriends(t)
		if (friends.status === 200 ) {
			setBlockFriends(friends.data.data? friends.data.data : [])
		}
	}

	const searchFriend = async (e) => {
		e.preventDefault()
		let username = e.target[0].value
		const friends = await Composite.searchFriendByUsername(username, accessToken)
		console.log(friends)
		if (friends.status === 200 ) {
			setSearchFriends(friends.data.data? friends.data.data : [])
		}
	}

	const addFriend = async (uuid) => {
		setLoadingAddFriend(true) // loading on
		const friends = await Composite.addFriend(uuid, accessToken)
		if (friends.status === 200) {
			setSearchFriends(null)
			setLoadingAddFriend(false) // loading off
		}
	}

	const acceptFriendRequest = async (uuid) => {
		const friends = await Composite.acceptFriend(uuid, accessToken)
		if (friends.status === 200) {
			getFriendRequest(accessToken)
			getMyFriends(accessToken)
		}
	}

	const blockFriend = async (friend) => {
		const friends = await Composite.blockFriend(friend, accessToken)
		if (friends.status === 200) {
			getFriendRequest(accessToken)
			getMyFriends(accessToken)
		}
    }
    
    const unBlockFriend = async (uuid) => {
        const friends = await Composite.unBlockFriend(uuid, accessToken)
		if (friends.status === 200) {
			getBlockFriends(accessToken)
		}
    }

    const deleteFriend = async (uuid) => {
        const friends = await Composite.deleteFriend(uuid, accessToken)
		if (friends.status === 200) {
			getBlockFriends(accessToken)
		}
	}

	const connectTwilioChat = async (token) => {
		const client = await Chat.create(token)
		setTwilioClient(client)
		console.log(client)
	}
	
	const getChatList = async () => {
		if (!twilioClient) {
			alert("Please connect twilio")
			return
		}
		const channels = await twilioClient.getSubscribedChannels()
		setChannelList(channels)
		console.log(channels)
	}

	const startChat = async (channel) => {
		if (channelSelected) {
			channelSelected.off('messageAdded', () => console.log("messageAdded has been leaved"))
		}

		setChannelSelected(channel)
		const msg = await channel.getMessages()
		setChatMessage(msg)
	}

	const handleSendMessage = async (e) => {
		e.preventDefault()
		let msg = e.target[0].value
		let oldMsg = chatMessage
		oldMsg.items.push({body: msg})
		setChatMessage(oldMsg)
		await channelSelected.sendMessage(msg)
		console.log(msg)
	}

	return (
		<div className="App" style={{padding: 20, border: 'solid 1px', margin: 5}}>
			
			<div id="login-box">
				<h3>Login</h3>
				<form onSubmit={ e => handleSibmit(e) }>
					<input defaultValue={username} type="text" placeholder="email"/>
					<input defaultValue={password} type="text" placeholder="password"/>
					<input type="submit" />
				</form>
				<hr/>
				<h3>use token login</h3>
				<textarea onChange={e => setAccessToken(e.target.value)} defaultValue={accessToken}/>
			</div>
            <hr/>

			<div id="find-friend-box">
				<h3>Search friend</h3>
				<form onSubmit={e => searchFriend(e)}>
					<input type="text" placeholder="search friends by username"/>
					<input type="submit" value="search"/>
				</form>
				{
					searchFriends &&
					<ul>
						<li>
							isfriend: {`${searchFriends.isFriend}`}<br/>
							isblock: {`${searchFriends.isBlock}`}<br/>
							username: {searchFriends.username} <br/>
							displayname: {searchFriends.displayName} <br/>
							uuid: {searchFriends.uuid} <br/>
                            {
                                !searchFriends.isFriend &&
							    <button disabled={loadingAddFriend} onClick={() => addFriend(searchFriends.uuid) }>
									{
										loadingAddFriend 
										?"...loading"
										:"add"
									}
								</button> 
                            }
						</li>
					</ul>
				}
			</div>
            <hr/>

			<div id="profile-box">
				<h3>Profile <button onClick={() => getUserProfile(accessToken)}><RefreshIcon/></button> </h3>
				{ userProfile &&
					<ul>
						<li><img width="40" src={userProfile.profileImage}/> {userProfile.username}</li>
						<li>{userProfile.displayName}</li>
						<li>{userProfile.usernamePrevious}</li>
						<li>{userProfile.uuid}</li>
					</ul>
				}
			</div>
            <hr/>

			<div id="friend-request-box">
				<h3>Friend Request <button onClick={() => getFriendRequest(accessToken)}><RefreshIcon/></button></h3>
				{	friendRequest &&
					<ul>
						{
							friendRequest.map((each, index) => (
								<li key={index}> 
									name: {each.username} <br/> 
									uuid: {each.uuid} <br/> 
									<button onClick={e => acceptFriendRequest(each.uuid)}> accept </button> 
                                    <button onClick={() => blockFriend(each)}> block </button>
								</li>
							))
						}
					</ul>
				}
			</div>
            <hr/>

			<div id="my-friend-box">
				<h3>My Friends <button onClick={() => getMyFriends(accessToken)}><RefreshIcon/></button></h3>
				{ myFriends&&
					<ul>
						{
							myFriends.map((each, index) => (
								<li key={index}> 
                                    name: {each.username} <br/>
                                    uuid: {each.uuid} <br/>
                                    <button onClick={() => blockFriend(each)}>block</button>
                                </li>
							))
						}
					</ul>
				}
			</div>
            <hr/>

			<div id="block-friend-box">
				<h3>Block Friends <button onClick={ (e) => getBlockFriends(accessToken)}><RefreshIcon/></button></h3>
				{ blockFriends&&
					<ul>
						{
							blockFriends.map((each, index) => (
								<li key={index}> name: {each.username} <br/>
                                 uuid: {each.uuid} <br/>
                                 <button onClick={() => unBlockFriend(each.uuid)}>unblock</button> 
                                 <button onClick={() => deleteFriend(each.uuid)}>delete</button>
                                </li>
							))
						}
					</ul>
				}
			</div>
			<hr/>
			<hr/>
			<hr/>

			<div id="channel-list-box">
				<h3>Twilio Token</h3>
				<textarea defaultValue={twilioToken}></textarea><br/>
				<button onClick={() => connectTwilioChat(twilioToken)}> Connect twilio </button>
				<hr/>
				<h3>Chat list <button onClick={ (e) => getChatList()}><RefreshIcon/></button></h3>
				{ channelList &&
					<ul>
						{
							channelList.items.map((each, index) => (
								<li key={index}> 
                                 channel SID : {each.sid} <br/>
								 <button onClick={ () => startChat(each) }>start chat</button>
                                </li>
							))
						}
					</ul>
				}
			</div>
			<hr/>

			<div id="chat-box">
				<h3>Chat box</h3>
				{ chatMessage &&
					<>
					<ul>
						{
							chatMessage.items.map((each, index) => (
								<li key={index}> 
								{each.body} <br/>
                                 {/* sid: {each.sid} <br/>
                                 <button onClick={() => unBlockFriend(each.uuid)}>unblock</button> 
                                 <button onClick={() => deleteFriend(each.uuid)}>delete</button> */}
                                </li>
							))
						}
					</ul>
					<form onSubmit={e => handleSendMessage(e)}>
						<input type="text" /> <button type="submit">send</button>
					</form>
					</>
				}
			</div>
			<hr/>

		</div>
	);
}

export default App;
