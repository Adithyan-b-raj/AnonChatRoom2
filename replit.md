# Real-Time Anonymous Chat Application

## Overview

This is a real-time anonymous chat application built with Node.js, Express, and Socket.IO that enables users to create and join chat rooms for instant messaging. The application features a clean web interface using Handlebars templating, real-time bidirectional communication through WebSockets, and in-memory storage for active users and chat room data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Handlebars (HBS) for server-side rendering of HTML views
- **Static Assets**: CSS styling served from the public directory with a modern gradient design
- **Client-Side Communication**: Socket.IO client for real-time messaging capabilities

### Backend Architecture
- **Web Framework**: Express.js server handling HTTP routes and static file serving
- **Real-Time Communication**: Socket.IO for WebSocket-based bidirectional communication
- **Server Structure**: Single-file application (app.js) with modular route handling
- **Data Storage**: In-memory storage using JavaScript Maps for active users and chat rooms

### Core Features
- **Anonymous Chat**: No registration required, users choose any username
- **Single Room Chat**: One global chat room for all users
- **User Management**: Active user tracking with username association
- **Message Handling**: Real-time message broadcasting to all users with message history
- **Typing Indicators**: Real-time typing status display
- **Session Management**: Socket-based user sessions with automatic cleanup
- **Username Modal**: Built-in username selection on first visit

### Data Management
- **Active Users**: Map storing socket ID to user information (username only)
- **Global Messages**: Array storing message history for the single chat room
- **Session Storage**: Temporary in-memory storage (data resets on server restart)
- **Message History**: Last 100 messages stored in memory

### Routing Structure
- **Homepage Route** (`/`): Direct access to the single chat room with username modal
- **Static Assets**: Automatic serving of CSS, JavaScript, and other static files

### Deployment Configuration
- **Target Platform**: Configured for runaway.app deployment
- **Deployment Type**: VM deployment for persistent WebSocket connections
- **Port Configuration**: Runs on port 5000 with proper host binding

## External Dependencies

### Core Dependencies
- **Express** (^4.18.2): Web application framework for Node.js
- **Socket.IO** (^4.7.2): Real-time bidirectional event-based communication library
- **Handlebars** (^4.7.8): Template engine for generating dynamic HTML content

### Development Considerations
- No database integration (purely in-memory storage)
- No authentication system implemented
- No external API integrations
- No persistent data storage mechanism
- Cache-free operation for development environment