import streamlit as st
from datetime import datetime

def initialize_session_state():
    """Initialize session state variables"""
    if 'editing_ticket_id' not in st.session_state:
        st.session_state.editing_ticket_id = None
    
    if 'status_filter' not in st.session_state:
        st.session_state.status_filter = []
    
    if 'priority_filter' not in st.session_state:
        st.session_state.priority_filter = []

    # Form fields
    if 'title' not in st.session_state:
        st.session_state.title = ""
    
    if 'description' not in st.session_state:
        st.session_state.description = ""
    
    if 'status' not in st.session_state:
        st.session_state.status = "To Do"
    
    if 'priority' not in st.session_state:
        st.session_state.priority = "Medium"
    
    if 'due_date' not in st.session_state:
        st.session_state.due_date = datetime.now()
