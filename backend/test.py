import google.generativeai as genai

genai.configure(api_key="AIzaSyCJb4wGb3Swah6aVfQ4pK8_cnnb423zf1U")


# List available models
for model in genai.list_models():
    print(model.name)