import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta

def render_sidebar():
    with st.sidebar:
        st.header("Filters")

        # Status filter
        st.session_state.status_filter = st.multiselect(
            "Status",
            ["To Do", "In Progress", "Done"],
            default=st.session_state.get('status_filter', [])
        )

        # Priority filter
        st.session_state.priority_filter = st.multiselect(
            "Priority",
            ["Low", "Medium", "High"],
            default=st.session_state.get('priority_filter', [])
        )

def render_dashboard(data_manager):
    stats = data_manager.get_ticket_stats()

    # Summary metrics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Tickets", stats['total'])
    with col2:
        st.metric("Open Tickets", stats['status_counts'].get('To Do', 0))
    with col3:
        st.metric("Completed Tickets", stats['status_counts'].get('Done', 0))

    # Charts
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Tickets by Status")
        status_df = pd.DataFrame({
            'Status': stats['status_counts'].index,
            'Count': stats['status_counts'].values
        })
        fig1 = px.pie(
            status_df,
            values='Count',
            names='Status',
            title="Ticket Distribution by Status"
        )
        st.plotly_chart(fig1)

    with col2:
        st.subheader("Tickets by Priority")
        priority_df = pd.DataFrame({
            'Priority': stats['priority_counts'].index,
            'Count': stats['priority_counts'].values
        })
        fig2 = px.bar(
            priority_df,
            x='Priority',
            y='Count',
            title="Ticket Distribution by Priority"
        )
        st.plotly_chart(fig2)

def render_ticket_form(data_manager):
    with st.form("ticket_form"):
        ticket_id = st.session_state.get('editing_ticket_id', None)

        title = st.text_input("Title", key="title")
        description = st.text_area("Description", key="description")
        status = st.selectbox("Status", ["To Do", "In Progress", "Done"], key="status")
        priority = st.selectbox("Priority", ["Low", "Medium", "High"], key="priority")
        due_date = st.date_input("Due Date", key="due_date")

        if st.form_submit_button("Save Ticket"):
            if not title:
                st.error("Title is required!")
                return

            if ticket_id:
                data_manager.update_ticket(ticket_id, title, description, status, priority, due_date)
                st.success("Ticket updated successfully!")
            else:
                data_manager.add_ticket(title, description, status, priority, due_date)
                st.success("Ticket added successfully!")

            # Clear form
            st.session_state.editing_ticket_id = None
            st.session_state.title = ""
            st.session_state.description = ""
            st.session_state.status = "To Do"
            st.session_state.priority = "Medium"
            st.session_state.due_date = datetime.now()

def render_ticket_list(data_manager):
    filtered_tickets = data_manager.get_filtered_tickets(
        st.session_state.status_filter,
        st.session_state.priority_filter
    )

    if filtered_tickets.empty:
        st.info("No tickets found matching the filters.")
        return

    for _, ticket in filtered_tickets.iterrows():
        with st.expander(f"{ticket['title']} ({ticket['status']})"):
            st.write(f"**Description:** {ticket['description']}")
            st.write(f"**Priority:** {ticket['priority']}")
            st.write(f"**Due Date:** {ticket['due_date'].strftime('%Y-%m-%d')}")

            col1, col2 = st.columns(2)
            with col1:
                if st.button("Edit", key=f"edit_{ticket['id']}"):
                    st.session_state.editing_ticket_id = ticket['id']
                    st.session_state.title = ticket['title']
                    st.session_state.description = ticket['description']
                    st.session_state.status = ticket['status']
                    st.session_state.priority = ticket['priority']
                    st.session_state.due_date = ticket['due_date']

            with col2:
                if st.button("Delete", key=f"delete_{ticket['id']}"):
                    data_manager.delete_ticket(ticket['id'])
                    st.success("Ticket deleted successfully!")
                    st.rerun()