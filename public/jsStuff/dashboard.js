const usernameDisplay = document.getElementById('username-display');
const topicsContainer = document.getElementById('topics-container');
const logoutBtn = document.getElementById('logout-btn');
const createTopicBtn = document.getElementById('create-topic-btn');
const createTopicModal = document.getElementById('create-topic');
const createTopicForm = document.getElementById('create-topic-form');
const closeModalBtns = document.querySelectorAll('.close');

const API_URL = 'http://localhost:3000';

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

const user = checkAuth();

if (user) {
    usernameDisplay.textContent = user.username;
}

async function fetchDashboard() {

    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || !user.id || user.id === 'dummyUserId123') {
        localStorage.clear(); 
        window.location.href = 'index.html';
        return;
    }
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        console.log('User object from localStorage:', user);
        
        if (!user || !user.username) {
            window.location.href = 'index.html';
            return;
        }
        
        const response = await fetch(`${API_URL}/topics/user/${user.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Response is not JSON:', await response.text());
            throw new Error('Expected JSON response from server');
        }
        
        const data = await response.json();
        console.log('Dashboard data:', data);
        
        if (response.ok && data.success) {
            displaySubscribedTopics(data.subscribedTopics);
        } else {
            alert(`Failed to load dashboard: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        alert('An error occurred while loading dashboard data. See console for details.');
    }
}


function displaySubscribedTopics(subscribedTopics) {
    if (!subscribedTopics || subscribedTopics.length === 0) {
        topicsContainer.innerHTML = '<p class="empty-message">You haven\'t subscribed to any topics yet.</p>';
        return;
    }
    
    topicsContainer.innerHTML = '';
    subscribedTopics.forEach(item => {
        const { topic, messages } = item;
        
        const topicCard = document.createElement('div');
        topicCard.className = 'topic-card';
        
        let topicHtml = `
            <h4>
                ${topic.title}
                <button class="unsubscribe-btn" data-topic-id="${topic._id}">Unsubscribe</button>
            </h4>
            <div class="messages-container">
        `;
        
        if (messages && messages.length > 0) {
            messages.forEach(message => {
                topicHtml += `
                    <div class="message-item">
                        <div class="message-header">${message.author ? message.author.username : 'Unknown'}</div>
                        <div class="message-content">${message.content}</div>
                        <div class="message-time">${new Date(message.createdAt).toLocaleString()}</div>
                    </div>
                `;
            });
        } else {
            topicHtml += '<p class="empty-message">No messages in this topic yet.</p>';
        }
        
        topicHtml += `
            </div>
            <button class="btn view-topic-btn" data-topic-id="${topic._id}">View Topic</button>
        `;
        
        topicCard.innerHTML = topicHtml;
        topicsContainer.appendChild(topicCard);
        
        const viewButton = topicCard.querySelector(`.view-topic-btn[data-topic-id="${topic._id}"]`);
        if (viewButton) {
            viewButton.addEventListener('click', () => {
                console.log('View Topic clicked for:', topic._id);
                window.location.href = `topics.html?id=${topic._id}`;
            });
        }
        
        const unsubscribeButton = topicCard.querySelector(`.unsubscribe-btn`);
        if (unsubscribeButton) {
            unsubscribeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                unsubscribeFromTopic(topic._id);
            });
        }
    });
}

async function unsubscribeFromTopic(topicId) {
    try {
        const response = await fetch(`${API_URL}/topics/${topicId}/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: user.id })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Successfully unsubscribed from topic');
            fetchDashboard(); 
        } else {
            alert(`Failed to unsubscribe: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error unsubscribing from topic:', error);
        alert('An error occurred while unsubscribing from the topic.');
    }
}

async function createTopic(title) {
    try {
        const response = await fetch(`${API_URL}/topics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                userId: user.id
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Topic created successfully!');
            fetchDashboard(); 
            closeModal(createTopicModal);
        } else {
            alert(`Failed to create topic: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error creating topic:', error);
        alert('An error occurred while creating the topic.');
    }
}


logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

createTopicBtn.addEventListener('click', () => {
    openModal(createTopicModal);
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

createTopicForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('topic-title').value;
    createTopic(title);
});

document.addEventListener('DOMContentLoaded', fetchDashboard);