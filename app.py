import streamlit as st
from main import predict

st.title("Basketball Highest Scoring Quarter Predictor")

api_key = st.text_input("API-Sports API Key", type="password", help="Enter your API-Sports API key")

# Layout: Team 1 | VS | Team 2
col1, col2, col3 = st.columns([2, 1, 2])

with col1:
    team1 = st.text_input("Team 1", placeholder="e.g., Los Angeles Lakers")

with col2:
    st.markdown("<h2 style='text-align: center;'>VS</h2>", unsafe_allow_html=True)

with col3:
    team2 = st.text_input("Team 2", placeholder="e.g., Boston Celtics")

if st.button("Predict Highest Scoring Quarter"):
    if not api_key:
        st.error("Please enter your API-Sports API key.")
    elif not team1.strip() or not team2.strip():
        st.error("Please enter both team names.")
    else:
        with st.spinner("Fetching data and predicting..."):
            try:
                result = predict(team1.strip(), team2.strip(), api_key)
                st.success(result)
            except ValueError as e:
                st.error(f"Error: {e}")
            except Exception as e:
                st.error(f"An unexpected error occurred: {e}")

st.markdown("---")
st.markdown("**Note:** Get your API key from [API-Sports](https://api-sports.io/).")