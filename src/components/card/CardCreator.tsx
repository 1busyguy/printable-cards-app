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

  function generateCardHtml(imageDataUrl: string = '') {
    // Use the passed imageDataUrl for both web and mobile platforms
    const imageSource = imageDataUrl || 'https://via.placeholder.com/400x300/e0e0e0/666666?text=No+Image';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Foldable Greeting Card</title>
          <style>
            @media print {
              @page {
                size: letter;
                margin: 0;
              }
              body {
                margin: 0;
              }
              .page-break {
                page-break-after: always;
              }
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: white;
            }
            
            .card-container {
              width: 8.5in;
              height: 11in;
              position: relative;
              overflow: hidden;
            }
            
            .fold-line-horizontal {
              position: absolute;
              width: 100%;
              height: 1px;
              border-top: 1px dashed #ccc;
              top: 5.5in;
              left: 0;
            }
            
            .fold-line-vertical {
              position: absolute;
              height: 100%;
              width: 1px;
              border-left: 1px dashed #ccc;
              left: 4.25in;
              top: 0;
            }
            
            .fold-instructions {
              position: absolute;
              font-size: 10px;
              color: #999;
              bottom: 0.25in;
              width: 100%;
              text-align: center;
            }
            
            .card-front {
              position: absolute;
              width: 4.25in;
              height: 5.5in;
              top: 0;
              left: 0;
              padding: 0.25in;
              box-sizing: border-box;
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            
            .card-inside-left {
              position: absolute;
              width: 4.25in;
              height: 5.5in;
              top: 0;
              left: 4.25in;
              padding: 0.25in;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            
            .card-inside-right {
              position: absolute;
              width: 4.25in;
              height: 5.5in;
              top: 5.5in;
              left: 0;
              padding: 0.25in;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            
            .card-back {
              position: absolute;
              width: 4.25in;
              height: 5.5in;
              top: 5.5in;
              left: 4.25in;
              padding: 0.25in;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
              align-items: center;
            }
            
            .image-container {
              width: 90%;
              height: 60%;
              overflow: hidden;
              margin-bottom: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            
            .image-container img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            
            .greeting {
              font-size: 18px;
              text-align: center;
              color: #333;
              line-height: 1.5;
              margin: 20px 0;
            }
            
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 15px;
              color: #333;
            }
            
            .footer {
              font-size: 12px;
              color: #888;
              margin-top: 20px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            <!-- Folding guidelines -->
            <div class="fold-line-horizontal"></div>
            <div class="fold-line-vertical"></div>
            <div class="fold-instructions">Fold along dotted lines</div>
            
            <!-- Card Front -->
            <div class="card-front">
              <div class="title">Happy Greetings!</div>
              <div class="image-container">
                <img src="${imageSource}" alt="Greeting Card Image" />
              </div>
            </div>
            
            <!-- Inside Left -->
            <div class="card-inside-left">
              <div class="image-container">
                <img src="${imageSource}" alt="Greeting Card Image" />
              </div>
            </div>
            
            <!-- Inside Right (main greeting area) -->
            <div class="card-inside-right">
              <div class="greeting">
                ${greeting || 'Your greeting will appear here'}
              </div>
            </div>
            
            <!-- Card Back -->
            <div class="card-back">
              <div class="footer">
                Created by ${user?.name || 'Card Creator User'} with Card Creator
              </div>
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

      // Handle different platforms
      let imageDataUrl = '';
      
      if (Platform.OS === 'web') {
        // Web platform: For web, we need to use browser APIs to convert the image
        // This is a simplified version that works in browsers but not in React Native
        try {
          // Pass the image URL directly for web platform
          imageDataUrl = selectedImage;
        } catch (error) {
          console.error('Error processing image on web:', error);
        }
      } else {
        // Mobile platforms: Use Expo FileSystem to convert to base64
        try {
          const imageBase64 = await FileSystem.readAsStringAsync(selectedImage, {
            encoding: FileSystem.EncodingType.Base64,
          });
          imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
        } catch (error) {
          console.error('Error converting image to base64:', error);
        }
      }

      // Generate and print the card
      const { uri } = await Print.printToFileAsync({
        html: generateCardHtml(imageDataUrl),
      });
      
      await Print.printAsync({ uri });
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

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          ℹ️ The card will be formatted to print on a standard letter-sized paper (8.5" x 11"), 
          with fold lines to create a greeting card.
        </Text>
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
  infoSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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