import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import ProfessionalCard from '../components/ProfessionalCard';
import GeminiAIService, { CropAnalysisResult } from '../services/GeminiAIService';

const { width, height } = Dimensions.get('window');

interface AnalysisHistory {
  id: string;
  imageUri: string;
  result: CropAnalysisResult;
  timestamp: Date;
  cropType?: string;
}

const CropAnalysisScreen = () => {
  const { colors, isDark } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CropAnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCropType, setSelectedCropType] = useState('Mixed Crop');

  const cropTypes = [
    'Mixed Crop', 'Tomato', 'Wheat', 'Rice', 'Corn', 'Potato', 
    'Onion', 'Carrot', 'Cabbage', 'Lettuce', 'Pepper', 'Cucumber'
  ];

  const severityColors = {
    low: colors.success,
    medium: colors.warning,
    high: colors.error,
  };

  // Mock camera functionality for now - in real implementation use react-native-image-picker
  const takePhoto = () => {
    Alert.alert(
      'Take Photo',
      'Camera functionality requires react-native-image-picker package. For demo, we\'ll use a sample image.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Use Sample', 
          onPress: () => {
            // Using a placeholder image - in real app this would be from camera
            setSelectedImage('https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Crop+Photo');
          }
        }
      ]
    );
  };

  const selectFromGallery = () => {
    Alert.alert(
      'Select Photo',
      'Gallery selection requires react-native-image-picker package. For demo, we\'ll use a sample image.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Use Sample', 
          onPress: () => {
            setSelectedImage('https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Gallery+Photo');
          }
        }
      ]
    );
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please take a photo or select from gallery first.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Convert image to base64 - this is simplified for demo
      // In real implementation, you'd convert the actual image file
      const base64Image = 'sample_base64_data'; // Placeholder
      
      const result = await GeminiAIService.analyzeCropPhoto(base64Image, selectedCropType);
      
      setAnalysisResult(result);
      
      // Add to history
      const newHistoryItem: AnalysisHistory = {
        id: Date.now().toString(),
        imageUri: selectedImage,
        result,
        timestamp: new Date(),
        cropType: selectedCropType,
      };
      
      setAnalysisHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep last 10

    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed', 
        'Please check your Gemini API key configuration and try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const CropTypeSelector = () => (
    <ProfessionalCard
      title="Crop Type"
      subtitle="Select your crop for better analysis"
      icon="grain"
      iconColor={colors.success}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropTypesScroll}>
        {cropTypes.map((crop) => (
          <TouchableOpacity
            key={crop}
            style={[styles.cropTypeButton, {
              backgroundColor: selectedCropType === crop ? colors.primary : colors.border,
              borderColor: selectedCropType === crop ? colors.primary : colors.border,
            }]}
            onPress={() => setSelectedCropType(crop)}
          >
            <Text style={[styles.cropTypeText, {
              color: selectedCropType === crop ? '#FFFFFF' : colors.text
            }]}>
              {crop}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ProfessionalCard>
  );

  const ImageCapture = () => (
    <ProfessionalCard
      title="Capture Image"
      subtitle="Take a clear photo of your crop"
      icon="camera"
      iconColor={colors.info}
    >
      <View style={styles.captureContainer}>
        {selectedImage ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity 
              style={[styles.removeImageButton, { backgroundColor: colors.error }]}
              onPress={() => setSelectedImage(null)}
            >
              <Icon name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
            <Icon name="image-plus" size={48} color={colors.textMuted} />
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
              No image selected
            </Text>
          </View>
        )}
        
        <View style={styles.captureButtons}>
          <TouchableOpacity 
            style={[styles.captureButton, { backgroundColor: colors.primary }]}
            onPress={takePhoto}
          >
            <Icon name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.captureButtonText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.captureButton, { backgroundColor: colors.secondary }]}
            onPress={selectFromGallery}
          >
            <Icon name="image" size={20} color="#FFFFFF" />
            <Text style={styles.captureButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ProfessionalCard>
  );

  const AnalysisButton = () => (
    <TouchableOpacity
      style={[styles.analyzeButton, { 
        backgroundColor: selectedImage ? colors.success : colors.textMuted 
      }]}
      onPress={analyzeImage}
      disabled={!selectedImage || isAnalyzing}
    >
      {isAnalyzing ? (
        <>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.analyzeButtonText}>Analyzing...</Text>
        </>
      ) : (
        <>
          <Icon name="brain" size={24} color="#FFFFFF" />
          <Text style={styles.analyzeButtonText}>Analyze with AI</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const AnalysisResults = () => (
    analysisResult && (
      <ProfessionalCard
        title="Analysis Results"
        subtitle={`Confidence: ${(analysisResult.confidence * 100).toFixed(1)}%`}
        icon="clipboard-check"
        iconColor={severityColors[analysisResult.severity]}
      >
        <View style={styles.resultContainer}>
          {analysisResult.diseaseName && (
            <View style={styles.resultSection}>
              <Text style={[styles.resultLabel, { color: colors.text }]}>Identified Issue:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{analysisResult.diseaseName}</Text>
            </View>
          )}
          
          <View style={styles.resultSection}>
            <Text style={[styles.resultLabel, { color: colors.text }]}>Severity Level:</Text>
            <View style={[styles.severityBadge, { backgroundColor: severityColors[analysisResult.severity] + '20' }]}>
              <Text style={[styles.severityText, { color: severityColors[analysisResult.severity] }]}>
                {analysisResult.severity.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.resultSection}>
            <Text style={[styles.resultLabel, { color: colors.text }]}>Urgency:</Text>
            <Text style={[styles.resultValue, { color: colors.textMuted }]}>{analysisResult.urgency}</Text>
          </View>
          
          {analysisResult.treatment.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={[styles.resultLabel, { color: colors.text }]}>Treatment Options:</Text>
              {analysisResult.treatment.map((treatment, index) => (
                <View key={`treatment-${index}`} style={styles.treatmentItem}>
                  <Icon name="medical-bag" size={16} color={colors.success} />
                  <Text style={[styles.treatmentText, { color: colors.textMuted }]}>{treatment}</Text>
                </View>
              ))}
            </View>
          )}
          
          {analysisResult.prevention.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={[styles.resultLabel, { color: colors.text }]}>Prevention Tips:</Text>
              {analysisResult.prevention.map((tip, index) => (
                <View key={`prevention-${index}`} style={styles.treatmentItem}>
                  <Icon name="shield-check" size={16} color={colors.info} />
                  <Text style={[styles.treatmentText, { color: colors.textMuted }]}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
          
          {analysisResult.additionalInfo && (
            <View style={[styles.additionalInfo, { backgroundColor: colors.border }]}>
              <Icon name="information" size={16} color={colors.info} />
              <Text style={[styles.additionalInfoText, { color: colors.textMuted }]}>
                {analysisResult.additionalInfo}
              </Text>
            </View>
          )}
        </View>
      </ProfessionalCard>
    )
  );

  const HistoryModal = () => (
    <Modal
      visible={showHistory}
      animationType="slide"
      transparent
      onRequestClose={() => setShowHistory(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Analysis History</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.historyList}>
            {analysisHistory.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.historyItem, { backgroundColor: colors.border }]}
                onPress={() => {
                  setSelectedImage(item.imageUri);
                  setAnalysisResult(item.result);
                  setShowHistory(false);
                }}
              >
                <Image source={{ uri: item.imageUri }} style={styles.historyImage} />
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyDate, { color: colors.text }]}>
                    {item.timestamp.toLocaleDateString()}
                  </Text>
                  <Text style={[styles.historyCrop, { color: colors.textMuted }]}>
                    {item.cropType}
                  </Text>
                  {item.result.diseaseName && (
                    <Text style={[styles.historyDisease, { color: severityColors[item.result.severity] }]}>
                      {item.result.diseaseName}
                    </Text>
                  )}
                </View>
                <Icon name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
            
            {analysisHistory.length === 0 && (
              <View style={styles.emptyHistory}>
                <Icon name="history" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyHistoryText, { color: colors.textMuted }]}>
                  No analysis history yet
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.statusBar} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>🔬 Crop Analysis</Text>
          <TouchableOpacity 
            style={[styles.historyButton, { backgroundColor: colors.border }]}
            onPress={() => setShowHistory(true)}
          >
            <Icon name="history" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          AI-powered crop disease detection and health analysis
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <CropTypeSelector />
        <ImageCapture />
        
        <View style={styles.analyzeContainer}>
          <AnalysisButton />
        </View>
        
        <AnalysisResults />
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <HistoryModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  historyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cropTypesScroll: {
    marginTop: 12,
  },
  cropTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  cropTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  captureContainer: {
    marginTop: 12,
  },
  imagePreview: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: width - 80,
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: width - 80,
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
  },
  captureButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 0.45,
    justifyContent: 'center',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  analyzeContainer: {
    marginVertical: 20,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  resultContainer: {
    marginTop: 12,
  },
  resultSection: {
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  treatmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  treatmentText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 8,
    lineHeight: 18,
  },
  additionalInfo: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  additionalInfoText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 8,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  historyList: {
    padding: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyCrop: {
    fontSize: 12,
    marginBottom: 2,
  },
  historyDisease: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 16,
    marginTop: 16,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default CropAnalysisScreen;