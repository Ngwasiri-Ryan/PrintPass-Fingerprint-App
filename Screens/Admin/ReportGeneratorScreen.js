import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Dimensions, Image, ScrollView, StatusBar, Platform } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import { firestore } from '../../Firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import images from '../../constants/images';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ReportGeneratorScreen = ({ navigation }) => {
  const [course, setCourse] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [reportData, setReportData] = useState(null);
  const [courseName, setCourseName] = useState('');

  const generateReport = async () => {
    if (!course || !sessionTime || !timestamp) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }

    try {
      const attendancesRef = collection(firestore, 'attendances');
      const attendanceQuery = query(
        attendancesRef,
        where('courseCode', '==', course)
      );

      const snapshot = await getDocs(attendanceQuery);
      const data = [];
      const inputDate = timestamp.split('-').reverse().join('-');

      snapshot.forEach(doc => {
        const attendance = doc.data();
        const attendanceDate = attendance.date.split(' ')[0].split('-').reverse().join('-');
        
        if (attendanceDate === inputDate && attendance.time === sessionTime) {
          data.push([attendance.studentName, attendance.matricule, attendance.date]);
        }
      });

      if (data.length > 0) {
        setReportData(data);
      } else {
        Alert.alert('No Records Found', 'No matching records found for the provided inputs.');
        setReportData(null);
      }

      // Fetch course name
      const coursesRef = collection(firestore, 'courses');
      const courseQuery = query(coursesRef, where('courseCode', '==', course));
      const courseSnapshot = await getDocs(courseQuery);

      if (!courseSnapshot.empty) {
        const courseDoc = courseSnapshot.docs[0];
        setCourseName(courseDoc.data().courseName);
      } else {
        setCourseName('');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while fetching the report.');
    }
  };

  const exportToPDF = async () => {
    if (!reportData) {
      Alert.alert('Error', 'No report data to export.');
      return;
    }
  
    let htmlContent = `
      <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 8px 12px;
            border: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f1f1f1;
          }
        </style>
      </head>
      <body>
        <h1>Attendance Report for ${course} on ${timestamp} at period ${sessionTime}</h1>
        <p>${reportData.length} student(s) present</p>
        <table>
          <tr>
            <th>Names</th>
            <th>Matricule</th>
            <th>Date</th>
          </tr>`;
  
    reportData.forEach(row => {
      htmlContent += `
        <tr>
          <td>${row[0]}</td>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
        </tr>`;
    });
  
    htmlContent += `</table></body></html>`;
  
    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      Alert.alert('Success', `PDF saved to ${uri}`);
      
      // Format sessionTime without ':00'
      const sessionTimeFormatted = sessionTime.replace(':00', '');
  
      // Construct PDF filename
      const filename = `${course}_att_${sessionTimeFormatted}_${timestamp}.pdf`;
  
      // Save the PDF file to external storage
      const externalDirectory = FileSystem.documentDirectory + 'reports/';
      const filePath = externalDirectory + filename;
  
      await FileSystem.makeDirectoryAsync(externalDirectory, { intermediates: true });
  
      await FileSystem.writeAsStringAsync(filePath, '', { encoding: FileSystem.EncodingType.UTF8 });
      await FileSystem.writeAsStringAsync(filePath, uri, { encoding: FileSystem.EncodingType.Base64 });
  
      // Let the user pick the location to save the file
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while creating the PDF.');
    }
  };
  
  
  const exportToExcel = async () => {
  if (!reportData) {
    Alert.alert('Error', 'No report data to export.');
    return;
  }

  const sessionTimeFormatted = sessionTime.replace(':00', '');

  const filename = `${course}_att_${timestamp}_${sessionTimeFormatted}.xlsx`;

  const ws = XLSX.utils.aoa_to_sheet([
    ['Names', 'Matricule', 'Date'],
    ...reportData
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

  const uri = FileSystem.documentDirectory + filename;

  try {
    await FileSystem.writeAsStringAsync(uri, wbout, {
      encoding: FileSystem.EncodingType.Base64
    });

    Alert.alert('Success', `Excel file saved as ${filename}`);

    // Open the file
    await Sharing.shareAsync(uri);
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'An error occurred while saving the Excel file.');
  }
};

  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={{ height: 20, width: 20 }}>
            <Image source={images.left_arrow} style={{ height: '100%', width: '100%', tintColor: '#1E90FF' }} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerText}>Report Generator</Text>
        <View />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={{ textAlign: 'center', marginTop: 10, marginBottom: 20 }}>Enter data to generate the attendance report</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Course Code"
              value={course}
              onChangeText={setCourse}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Session Time (h:00 am/pm - h:00 am/pm)"
              value={sessionTime}
              onChangeText={setSessionTime}
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Date (day-month-year)"
              value={timestamp}
              onChangeText={setTimestamp}
            />
          </View>
          <TouchableOpacity style={styles.generateButton} onPress={generateReport}>
            <Text style={styles.generateButtonText}>Generate Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reportContainer}>
          {reportData ? (
            <>
              <View style={styles.reportHeader}>
                <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Attendance Report for {course} on {timestamp} at period {sessionTime} </Text>
                <View style={{ display: 'flex', flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                  <View style={{ height: 25, width: 25 }}>
                    <Image source={images.student} style={{ height: '100%', width: '100%', tintColor: '#1E90FF' }} />
                  </View>
                  <Text style={{ fontWeight: 'bold' }}>{reportData.length} student(s) present</Text>
                </View>
              </View>

              <Table borderStyle={{ borderWidth: 1 }}>
                <Row
                  data={['Names', 'Matricule', 'Date']}
                  style={styles.head}
                  textStyle={styles.text}
                />
                <Rows
                  data={reportData}
                  textStyle={styles.text}
                />
              </Table>
            </>
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image source={images.report} style={{ width: '100%', height: 350, paddingTop: 10 }} resizeMode="contain" />
            </View>
          )}
        </View>

        <View style={styles.exportOptions}>
          <TouchableOpacity onPress={exportToPDF}>
            <View style={{ height: 30, width: 30 }}>
              <Image source={images.pdf} style={{ height: '100%', width: '100%' }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={exportToExcel}>
            <View style={{ height: 30, width: 30 }}>
              <Image source={images.excel} style={{ height: '100%', width: '100%' }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <View style={{ height: 30, width: 30 }}>
              <Image source={images.documents} style={{ height: '100%', width: '100%' }} />
            </View>
          </TouchableOpacity>

          
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingTop: 90, // Add padding to account for the fixed header
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: screenHeight/15,
    backgroundColor: '#f5f5f5',
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10, // Ensure the header is on top
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: '#f2f2f2',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  generateButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  reportContainer: {
    marginTop: 5,
    padding: 15,
    borderRadius: 5,
    width: '100%',
    height: 300,
    marginBottom: 4,
    top:-10,
  },
  reportHeader: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
    alignItems: 'center',
    borderRadius: 8,
    width: screenWidth - 32,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 10,
  },
  exportOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    marginBottom: 20,
  },
  head: {
    height: 40,
    backgroundColor: '#f1f8ff',
  },
  text: {
    margin: 6,
    textAlign: 'center',
  },
});

export default ReportGeneratorScreen;
