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
    // Use a placeholder image if no image data is provided
    const imageSource = imageDataUrl || 'https://via.placeholder.com/400x300/e0e0e0/666666?text=No+Image';
    
    // Format greeting text with proper line breaks for HTML
    const formattedGreeting = greeting.replace(/\n/g, '<br>');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
              .fold-line-horizontal, .fold-line-vertical, .fold-instructions {
                display: block !important;
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
              background-color: white;
              page-break-after: always;
            }
            
            .fold-line-horizontal {
              position: absolute;
              width: 100%;
              height: 1px;
              border-top: 2px dashed #999;
              top: 5.5in;
              left: 0;
              z-index: 100;
            }
            
            .fold-line-vertical {
              position: absolute;
              height: 100%;
              width: 1px;
              border-left: 2px dashed #999;
              left: 4.25in;
              top: 0;
              z-index: 100;
            }
            
            .fold-instructions {
              position: absolute;
              font-size: 10px;
              color: #777;
              bottom: 0.25in;
              width: 100%;
              text-align: center;
              z-index: 100;
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
              background-color: white;
              z-index: 1;
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
              background-color: white;
              z-index: 1;
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
              background-color: white;
              z-index: 1;
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
              background-color: white;
              z-index: 1;
            }
            
            .image-container {
              width: 90%;
              height: 60%;
              overflow: hidden;
              margin-bottom: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #f9f9f9;
              border: 1px solid #eee;
              border-radius: 5px;
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
              width: 90%;
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

            .folding-guide {
              position: absolute;
              top: 11.5in;
              left: 0;
              width: 8.5in;
              padding: 0.5in;
              text-align: center;
              font-size: 14px;
              line-height: 1.5;
              color: #333;
              border-top: 1px solid #ccc;
            }

            .steps {
              text-align: left;
              margin: 0 auto;
              width: 80%;
            }

            .step {
              margin-bottom: 10px;
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
                ${formattedGreeting || 'Your greeting will appear here'}
              </div>
            </div>
            
            <!-- Card Back -->
            <div class="card-back">
              <div class="footer">
                Created by ${user?.name || 'Card Creator User'} with Card Creator
              </div>
            </div>
          </div>
          
          <!-- Folding Guide -->
          <div class="folding-guide">
            <h3>How to fold your card:</h3>
            <div class="steps">
              <div class="step">1. Print this page on letter-sized paper (8.5" x 11")</div>
              <div class="step">2. Fold the paper in half horizontally along the horizontal dotted line</div>
              <div class="step">3. Fold the paper in half vertically along the vertical dotted line</div>
              <div class="step">4. The front of the card should now be visible with your image</div>
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
      
      // Handle image processing differently for web and mobile
      let imageDataUrl = '';
      
      if (Platform.OS === 'web') {
        try {
          // For web, fetch the image and convert it to a data URL
          const response = await fetch(selectedImage);
          const blob = await response.blob();
          
          // Create a FileReader to convert the blob to a data URL
          imageDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error('Error processing image on web:', error);
          // Use the direct URL as fallback if fetch fails
          imageDataUrl = selectedImage;
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

      // Generate the HTML for the card
      const html = generateCardHtml(imageDataUrl);
      
      // Create a printable file
      const { uri } = await Print.printToFileAsync({
        html,
        width: 8.5 * 96, // 8.5 inches at 96 DPI
        height: 11 * 96, // 11 inches at 96 DPI
        base64: false
      });
      
      // Check if the URI exists before printing
      if (!uri) {
        throw new Error('Failed to generate printable file');
      }
      
      // Show the print dialog
      await Print.printAsync({ 
        uri,
        orientation: Print.Orientation.portrait
      });
    } catch (error) {
      console.error('Error generating printable card:', error);
      Alert.alert('Error', 'Failed to generate printable card. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Preview the card directly in the app
  function previewCard() {
    if (!selectedImage) {
      Alert.alert('Missing Image', 'Please select an image for your card');
      return;
    }

    if (!greeting.trim()) {
      Alert.alert('Missing Greeting', 'Please add a greeting message for your card');
      return;
    }

    // Logic for previewing the card could be added here
    Alert.alert(
      'Card Preview', 
      'Your card has been created with your image and the greeting: "' + greeting + '"',
      [
        { text: 'OK' }
      ]
    );
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
          ℹ️ The card will be formatted to print on a standard letter-sized paper (8.5" x 11"). 
          After printing, fold the paper along the dotted lines to create your greeting card.
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
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
      </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    flex: 1,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 