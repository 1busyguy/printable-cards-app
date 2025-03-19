import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { useAuth } from '../../context/AuthContext';

export function CardCreator() {
  const [greeting, setGreeting] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  async function pickImage() {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'You need to grant permission to access your photos');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }

  function generateCardHtml() {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Greeting Card</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background-color: white;
            }
            .card {
              width: 800px;
              height: 600px;
              border: 1px solid #ccc;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 20px;
              background-color: white;
            }
            .image-container {
              width: 100%;
              height: 65%;
              display: flex;
              justify-content: center;
              margin-bottom: 20px;
            }
            .image-container img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            .greeting {
              font-size: 24px;
              text-align: center;
              margin-top: 20px;
              color: #333;
              line-height: 1.5;
            }
            .footer {
              font-size: 14px;
              color: #888;
              margin-top: 20px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="image-container">
              ${selectedImage ? `<img src="${selectedImage}" alt="Greeting Card Image" />` : ''}
            </div>
            <div class="greeting">
              ${greeting || 'Your greeting will appear here'}
            </div>
            <div class="footer">
              Created by ${user?.name || 'Card Creator User'} with Card Creator
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async function generatePrintableCard() {
    if (!selectedImage) {
      Alert.alert('Missing Image', 'Please select an image for your card');
      return;
    }

    if (!greeting.trim()) {
      Alert.alert('Missing Greeting', 'Please add a greeting message for your card');
      return;
    }

    try {
      setIsLoading(true);

      // For web platform, we can directly use the HTML to generate a PDF
      if (Platform.OS === 'web') {
        const { uri } = await Print.printToFileAsync({
          html: generateCardHtml(),
        });
        Print.printAsync({ uri });
      } else {
        // For mobile platforms, we need to create a base64 string from the image
        const imageBase64 = await FileSystem.readAsStringAsync(selectedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Generate HTML with base64 image
        const htmlContent = generateCardHtml().replace(
          selectedImage,
          `data:image/jpeg;base64,${imageBase64}`
        );

        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
        });

        // Show print dialog
        await Print.printAsync({ uri });
      }
    } catch (error) {
      console.error('Error generating printable card:', error);
      Alert.alert('Error', 'Failed to generate printable card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Your Greeting Card</Text>
      
      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>Card Image</Text>
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Text style={styles.imagePickerButtonText}>
            {selectedImage ? 'Change Image' : 'Select Image'}
          </Text>
        </TouchableOpacity>
        
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          </View>
        )}
      </View>
      
      <View style={styles.greetingSection}>
        <Text style={styles.sectionTitle}>Greeting Message</Text>
        <TextInput
          style={styles.greetingInput}
          placeholder="Enter your greeting message here..."
          value={greeting}
          onChangeText={setGreeting}
          multiline
          numberOfLines={4}
        />
      </View>
      
      <TouchableOpacity
        style={styles.generateButton}
        onPress={generatePrintableCard}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.generateButtonText}>Generate Printable Card</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#4285F4',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  imageSection: {
    marginBottom: 24,
  },
  imagePickerButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerButtonText: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  greetingSection: {
    marginBottom: 24,
  },
  greetingInput: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  generateButton: {
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 