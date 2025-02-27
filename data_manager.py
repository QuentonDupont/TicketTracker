import pandas as pd
import streamlit as st
from datetime import datetime

class DataManager:
    def __init__(self):
        if 'tickets' not in st.session_state:
            st.session_state.tickets = pd.DataFrame({
                'id': [],
                'title': [],
                'description': [],
                'status': [],
                'priority': [],
                'created_date': [],
                'due_date': []
            })

    def add_ticket(self, title, description, status, priority, due_date):
        new_ticket = pd.DataFrame({
            'id': [len(st.session_state.tickets) + 1],
            'title': [title],
            'description': [description],
            'status': [status],
            'priority': [priority],
            'created_date': [datetime.now()],
            'due_date': [due_date]
        })
        st.session_state.tickets = pd.concat([st.session_state.tickets, new_ticket], ignore_index=True)

    def update_ticket(self, ticket_id, title, description, status, priority, due_date):
        idx = st.session_state.tickets.index[st.session_state.tickets['id'] == ticket_id].tolist()[0]
        st.session_state.tickets.at[idx, 'title'] = title
        st.session_state.tickets.at[idx, 'description'] = description
        st.session_state.tickets.at[idx, 'status'] = status
        st.session_state.tickets.at[idx, 'priority'] = priority
        st.session_state.tickets.at[idx, 'due_date'] = due_date

    def delete_ticket(self, ticket_id):
        st.session_state.tickets = st.session_state.tickets[st.session_state.tickets['id'] != ticket_id]

    def get_filtered_tickets(self, status_filter=None, priority_filter=None):
        df = st.session_state.tickets.copy()
        
        if status_filter:
            df = df[df['status'].isin(status_filter)]
        if priority_filter:
            df = df[df['priority'].isin(priority_filter)]
            
        return df

    def get_ticket_stats(self):
        total_tickets = len(st.session_state.tickets)
        status_counts = st.session_state.tickets['status'].value_counts()
        priority_counts = st.session_state.tickets['priority'].value_counts()
        
        return {
            'total': total_tickets,
            'status_counts': status_counts,
            'priority_counts': priority_counts
        }
