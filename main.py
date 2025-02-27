import streamlit as st
import pandas as pd
from datetime import datetime
from data_manager import DataManager
from components import (
    render_sidebar,
    render_dashboard,
    render_ticket_form,
    render_ticket_list
)
from utils import initialize_session_state

def main():
    st.set_page_config(
        page_title="Project Management Tracker",
        page_icon="📋",
        layout="wide"
    )

    # Initialize session state
    initialize_session_state()

    # Initialize data manager
    data_manager = DataManager()

    # Sidebar
    render_sidebar()

    # Main content
    st.title("📋 Project Management Tracker")

    # Tabs for different views
    tab1, tab2 = st.tabs(["Dashboard", "Ticket Management"])

    with tab1:
        render_dashboard(data_manager)

    with tab2:
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.subheader("Ticket List")
            render_ticket_list(data_manager)
        
        with col2:
            st.subheader("Add/Edit Ticket")
            render_ticket_form(data_manager)

if __name__ == "__main__":
    main()
