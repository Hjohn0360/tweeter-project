const availableTopicsContainer = document.getElementById('available-topics');
const logoutBtn = document.getElementById('logout-btn');
const topicDetailModal = document.getElementById('topic-detail');
const topicDetailContent = document.getElementById('topic-detail-content');
const postMessageForm = document.getElementById('post-message-form');
const messageContent = document.getElementById('message-content');
const closeModalBtns = document.querySelectorAll('.close');

const API_URL = 'https://tweeter-project-6tb9.onrender.com';

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

const user = checkAuth();
let currentTopicId = null;

async function fetchAvailableTopics() {
    try {
        const loginResponse = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: user.username })
        });
        
        const userData = await loginResponse.json();
        
        if (!loginResponse.ok || !userData.success) {
            throw new Error(userData.message || 'Failed to fetch user data');
        }
        
        const topicsResponse = await fetch(`${API_URL}/topics`);
        const topics = await topicsResponse.json();
        
        if (!topicsResponse.ok) {
            throw new Error('Failed to fetch topics');
        }
        
        const subscribedTopicIds = userData.subscribedTopics.map(item => item.topic._id);
        const availableTopics = topics.filter(topic => !subscribedTopicIds.includes(topic._id));
        
        displayAvailableTopics(availableTopics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        alert('An error occurred while loading topics.');
    }
}

function displayAvailableTopics(topics) {
    if (!topics || topics.length === 0) {
        availableTopicsContainer.innerHTML = '<p class="empty-message">No available topics to subscribe to.</p>';
        return;
    }
    
    availableTopicsContainer.innerHTML = '';
    topics.forEach(topic => {
        const topicElement = document.createElement('div');
        topicElement.className = 'topic-item';
        topicElement.innerHTML = `
            <h3>${topic.title}</h3>
            <p>Created: ${new Date(topic.createdAt).toLocaleDateString()}</p>
            <button class="btn subscribe-btn" data-topic-id="${topic._id}">Subscribe</button>
            <button class="btn" data-topic-id="${topic._id}">View Details</button>
        `;
        
        availableTopicsContainer.appendChild(topicElement);
        
        const subscribeBtn = topicElement.querySelector('.subscribe-btn');
        subscribeBtn.addEventListener('click', () => {
            subscribeTopic(topic._id);
        });
        
        const viewBtn = topicElement.querySelector('button:not(.subscribe-btn)');
        viewBtn.addEventListener('click', () => {
            viewTopicDetails(topic._id);
        });
    });
}


async function subscribeTopic(topicId) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
            alert('You must be logged in to subscribe to topics');
            return;
        }
        
        console.log(`Attempting to subscribe to topic: ${topicId} for user: ${user.id}`);
        
        const response = await fetch(`${API_URL}/topics/${topicId}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: user.id })
        });
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Error parsing response as JSON:', e);
            alert('Error subscribing to topic: Invalid server response');
            return;
        }
        
        console.log('Subscribe response data:', data);
        
        if (response.ok) {
            alert('Successfully subscribed to topic!');
            
            if (currentTopicId === topicId) {
                viewTopicDetails(topicId);
            }
            
            fetchAvailableTopics();
        } else {
            alert(`Failed to subscribe: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error subscribing to topic:', error);
        alert('An error occurred while subscribing to the topic.');
    }
}


async function viewTopicDetails(topicId) {
    try {
        console.log('Viewing topic details for ID:', topicId);
        
        const response = await fetch(`${API_URL}/topics/${topicId}`);
        
        const rawResponse = await response.text();
        console.log('Raw response:', rawResponse);
        
        const data = JSON.parse(rawResponse);
        console.log('Parsed topic data:', data);
        
        if (response.ok) {
            currentTopicId = topicId;
            renderTopicDetails(data);
            openModal(topicDetailModal);
        } else {
            alert(`Failed to fetch topic details: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error fetching topic details:', error);
        alert('An error occurred while loading topic details.');
    }
}

function renderTopicDetails(data) {
    const { topic, messages } = data;
    const user = JSON.parse(localStorage.getItem('user'));
    
    const isSubscribed = user && user.subscribedTopics && 
                         user.subscribedTopics.some(id => id === topic._id);
    
    let detailsHtml = `
        <div class="topic-detail-header">
            <h3>${topic.title}</h3>
            <p>Created: ${new Date(topic.createdAt).toLocaleDateString()}</p>
            <p>Access count: ${topic.accessCount}</p>
        </div>
    `;
    
    if (!isSubscribed) {
        detailsHtml += `
            <button id="subscribe-btn" class="btn btn-primary">Subscribe to Topic</button>
        `;
    }
    
    detailsHtml += `
        <div class="topic-messages">
            <h4>Messages</h4>
    `;
    
    if (messages && messages.length > 0) {
        detailsHtml += '<div class="messages-list">';
        messages.forEach(message => {
            detailsHtml += `
                <div class="message-item">
                    <div class="message-header">${message.author ? message.author.username : 'Unknown'}</div>
                    <div class="message-content">${message.content}</div>
                    <div class="message-time">${new Date(message.createdAt).toLocaleString()}</div>
                </div>
            `;
        });
        detailsHtml += '</div>';
    } else {
        detailsHtml += '<p class="empty-message">No messages in this topic yet.</p>';
    }
    
    detailsHtml += '</div>';
    
    if (isSubscribed) {
        detailsHtml += `
            <div class="post-message">
                <h4>Post a Message</h4>
                <form id="post-message-form">
                    <div class="form-group">
                        <textarea id="message-content" rows="3" placeholder="Type your message here..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Post Message</button>
                </form>
            </div>
        `;
    }
    
    topicDetailContent.innerHTML = detailsHtml;
    
    const subscribeBtn = document.getElementById('subscribe-btn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => {
            subscribeTopic(topic._id);
        });
    }
    
    const postForm = document.getElementById('post-message-form');
    if (postForm) {
        postForm.addEventListener('submit', handlePostMessage);
    }
}

function handlePostMessage(e) {
    e.preventDefault();
    
    if (!currentTopicId) {
        alert('No topic selected');
        return;
    }
    
    const content = document.getElementById('message-content').value.trim();
    if (!content) {
        alert('Please enter a message');
        return;
    }
    
    postMessage(currentTopicId, content);
}

async function postMessage(topicId, content) {
    try {
        console.log('Sending message data:', {
            topicId,
            userId: user.id,
            content
        });
        
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topicId,
                userId: user.id,
                content
            })
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            console.log('Message posted successfully');
            messageContent.value = '';
            
            viewTopicDetails(topicId);
        } else {
            console.error('Server returned error:', data);
            alert(`Failed to post message: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error posting message:', error);
        alert('An error occurred while posting the message.');
    }
}

function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
    currentTopicId = null;
}

postMessageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentTopicId) {
        alert('No topic selected');
        return;
    }
    
    const content = messageContent.value.trim();
    if (!content) {
        alert('Please enter a message');
        return;
    }
    
    postMessage(currentTopicId, content);
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        closeModal(modal);
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

function checkUrlForTopicId() {
    const urlParams = new URLSearchParams(window.location.search);
    const topicId = urlParams.get('id');
    
    if (topicId) {
        viewTopicDetails(topicId);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAvailableTopics();
    checkUrlForTopicId();
});