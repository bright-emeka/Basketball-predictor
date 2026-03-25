import streamlit as st
from main import predict, predict_lowest_scoring

st.title("Basketball Highest Scoring Quarter Predictor")

# Get API key from sidebar
api_key = st.sidebar.text_input("API-Sports API Key", type="password", help="Enter your API-Sports API key")

# Stop if no API key provided
if not api_key.strip():
    st.warning("Please enter your API-Sports API key in the sidebar to proceed.")
    st.stop()

# Layout: Team 1 | VS | Team 2
col1, col2, col3 = st.columns([2, 1, 2])

with col1:
    team1 = st.text_input("Team 1", placeholder="e.g., Los Angeles Lakers")

with col2:
    st.markdown("<h2 style='text-align: center;'>VS</h2>", unsafe_allow_html=True)

with col3:
    team2 = st.text_input("Team 2", placeholder="e.g., Boston Celtics")

# Create two columns for buttons
btn_col1, btn_col2 = st.columns(2)

with btn_col1:
    if st.button("Predict Highest Scoring Quarter"):
        if not team1.strip() or not team2.strip():
            st.error("Please enter both team names.")
        else:
            with st.spinner("Fetching data and predicting..."):
                try:
                    result = predict(team1.strip(), team2.strip(), api_key.strip())
                    st.success(result)
                except ValueError as e:
                    st.error(f"Error: {e}")
                except Exception as e:
                    st.error(f"An unexpected error occurred: {e}")

with btn_col2:
    if st.button("Predict Lowest Scoring Quarter"):
        if not team1.strip() or not team2.strip():
            st.error("Please enter both team names.")
        else:
            with st.spinner("Fetching data and calculating..."):
                try:
                    result, source = predict_lowest_scoring(team1.strip(), team2.strip(), api_key.strip())
                    if result:
                        st.info(f"📊 Lowest scoring quarter based on {source}:\\n\\n{result}")
                except ValueError as e:
                    st.error(f"Error: {e}")
                except Exception as e:
                    st.error(f"An unexpected error occurred: {e}")

st.markdown("---")
st.markdown("**Note:** Get your API key from [API-Sports](https://api-sports.io/).")