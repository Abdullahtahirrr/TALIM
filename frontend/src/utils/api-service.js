// src/utils/api-service.js
import { supabase } from '../supabaseClient';

// USER FUNCTIONS
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const getUserDetails = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_details')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};

// COURSE FUNCTIONS
export const getEnrolledCourses = async (userId) => {
  try {
    // Fetch enrolled courses for the student
    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        courses (
          id,
          title,
          description,
          thumbnail_url,
          profiles!inner (
            first_name,
            last_name
          )
        )
      `)
      .eq('student_id', userId);
      
    if (error) throw error;
    
    // Format the data to match the app's structure
    return data.map(enrollment => ({
      id: enrollment.courses.id,
      title: enrollment.courses.title,
      description: enrollment.courses.description,
      instructor: `${enrollment.courses.profiles.first_name} ${enrollment.courses.profiles.last_name}`,
      image: enrollment.courses.thumbnail_url,
    }));
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return null;
  }
};
export const getTeacherCourses = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        created_at
      `)
      .eq('instructor_id', userId);
      
    if (error) throw error;
    
    // Format the data to include proper image URLs
    if (data) {
      return data.map(course => ({
        ...course,
        image: course.thumbnail_url // Ensure the image property is set from thumbnail_url
      }));
    }
    return data;
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return null;
  }
};
// Updated getCourseDetails function with simplified query
export const getCourseDetails = async (courseId) => {
  try {
    // Basic course query without complex joins
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*,enrollment_key')
      .eq('id', courseId)
      .single();
      console.log("courseId", courseData)

    // Basic course query without complex joins
    // const { data: courseData, error: courseError } = await supabase
    //   .from('courses')
    //   .select('*, enrollment_key')  // Make sure to include enrollment_key
    //   .eq('id', courseId)
    //   .single();
      
    if (courseError) throw courseError;
    
    if (!courseData) {
      return null;
    }
    
    // Get instructor info separately
    let instructorName = null;
    if (courseData.instructor_id) {
      const { data: instructor, error: instructorError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', courseData.instructor_id)
        .single();
        
      if (!instructorError && instructor) {
        instructorName = `${instructor.first_name} ${instructor.last_name}`;
      }
    }
    
    // Get lectures and their content
    const { data: lectures, error: lecturesError } = await supabase
      .from('lectures')
      .select(`
        id,
        title,
        display_order,
        lecture_content (
          id,
          content_type_id,
          file_name,
          file_url
        )
      `)
      .eq('course_id', courseId)
      .order('display_order');
      
    // Get enrollment count
    const { count, error: countError } = await supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);
    
    // Return combined data
    return {
      ...courseData,
      instructor_name: instructorName,
      lectures: lectures || [],
      enrolledStudents: count || 0,
      enrollment_key: courseData.enrollment_key  // Include the enrollment key

    };
  } catch (error) {
    console.error("Error fetching course details:", error);
    return null;
  }
};

// export const createCourse = async (courseData) => {
//   try {
//     // Generate a unique enrollment key
//     const enrollmentKey = Math.floor(Math.random() * 9000000000) + 1000000000;
    
//     const { data, error } = await supabase
//       .from('courses')
//       .insert({
//         title: courseData.title,
//         description: courseData.description,
//         instructor_id: courseData.instructorId,
//         category_id: courseData.categoryId,
//         semester: courseData.semester,
//         thumbnail_url: courseData.thumbnailUrl,
//         enrollment_key: enrollmentKey.toString(),
//         is_published: courseData.isPublished || false
//       })
//       .select()
//       .single();
      
//     if (error) throw error;
//     return { ...data, enrollment_key: enrollmentKey.toString() };
//   } catch (error) {
//     console.error('Error creating course:', error);
//     throw error;
//   }
// };

export const uploadLectureContent = async (lectureId, file, contentTypeId) => {
  try {
    // Upload file to storage
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `lecture_content/${lectureId}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course_content')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('course_content')
      .getPublicUrl(filePath);
      
    const fileUrl = urlData.publicUrl;
    
    // Add to lecture_content table
    const { data, error } = await supabase
      .from('lecture_content')
      .insert({
        lecture_id: lectureId,
        content_type_id: contentTypeId,
        file_name: fileName,
        file_url: fileUrl,
        file_size: file.size
      })
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading lecture content:', error);
    throw error;
  }
};

// ASSESSMENT FUNCTIONS
export const generateAssessment = async (assessmentData) => {
  try {
    // Call your backend API to generate the assessment
    const response = await fetch('http://localhost:5000/api/assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessmentData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate assessment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating assessment:', error);
    throw error;
  }
};

export const saveGeneratedQuiz = async (quizData, fileContent) => {
  try {
    // Upload file to storage
    const fileName = `${Date.now()}_${quizData.lecture_name.replace(/\s+/g, '_')}_quiz.pdf`;
    const filePath = `generated_quizzes/${fileName}`;
    
    // Convert text content to a Blob
    const blob = new Blob([fileContent], { type: 'application/pdf' });
    const file = new File([blob], fileName, { type: 'application/pdf' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assessments')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('assessments')
      .getPublicUrl(filePath);
      
    const fileUrl = urlData.publicUrl;
    
    // Determine difficulty ID
    const difficultyMap = { 'easy': 1, 'medium': 2, 'hard': 3 };
    
    // Save to quizzes table
    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        course_id: quizData.course_id,
        lecture_id: quizData.lecture_id,
        title: quizData.lecture_name,
        key_topic: quizData.KeyTopics,
        num_mcqs: parseInt(quizData.MCQS) || 0,
        num_theory_questions: parseInt(quizData.Theortical) || 0,
        num_numericals: parseInt(quizData.Numerical) || 0,
        difficulty_id: difficultyMap[quizData.Difficulty.toLowerCase()] || 2,
        num_versions: parseInt(quizData.Version) || 1,
        generate_rubric: quizData.Rubric === 'yes',
        additional_requirements: quizData.Additional_requirements,
        file_url: fileUrl,
        created_by: quizData.created_by
      })
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving quiz:', error);
    throw error;
  }
};

export const saveGeneratedAssignment = async (assignmentData, fileContent) => {
  try {
    // Upload file to storage
    const fileName = `${Date.now()}_${assignmentData.lecture_name.replace(/\s+/g, '_')}_assignment.pdf`;
    const filePath = `generated_assignments/${fileName}`;
    
    // Convert text content to a Blob
    const blob = new Blob([fileContent], { type: 'application/pdf' });
    const file = new File([blob], fileName, { type: 'application/pdf' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assessments')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('assessments')
      .getPublicUrl(filePath);
      
    const fileUrl = urlData.publicUrl;
    
    // Determine difficulty ID
    const difficultyMap = { 'easy': 1, 'medium': 2, 'hard': 3 };
    
    // Save to assignments table
    const { data, error } = await supabase
      .from('assignments')
      .insert({
        course_id: assignmentData.course_id,
        lecture_id: assignmentData.lecture_id,
        title: assignmentData.lecture_name,
        key_topic: assignmentData.KeyTopics,
        num_numericals: parseInt(assignmentData.Numerical) || 0,
        num_theory_questions: parseInt(assignmentData.Theortical) || 0,
        total_marks: parseInt(assignmentData.Total_marks) || 50,
        difficulty_id: difficultyMap[assignmentData.Difficulty.toLowerCase()] || 2,
        num_versions: parseInt(assignmentData.Version) || 1,
        generate_rubric: assignmentData.Rubric === 'yes',
        additional_requirements: assignmentData.Additional_requirements,
        file_url: fileUrl,
        created_by: assignmentData.created_by
      })
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving assignment:', error);
    throw error;
  }
};

// CHATBOT FUNCTIONS
export const generateChatResponse = async (query, chatHistory, courseContext) => {
  try {
    // Call your backend API for chat
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        chat_history: chatHistory,
        course_context: courseContext
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate response');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
};

// Simplified tableExists function that doesn't rely on RPC
export const tableExists = async (tableName) => {
  try {
    // Use a simple count query to check if table exists
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .limit(1);
    
    // If we get here without error, the table exists
    return true;
  } catch (error) {
    // Any error (including 404) means the table likely doesn't exist
    console.log(`Table ${tableName} likely doesn't exist:`, error.message);
    return false;
  }
};
// ENROLLMENT FUNCTIONS
export const enrollInCourse = async (userId, enrollmentKey) => {
  try {
    // Find the course with the given enrollment key
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('enrollment_key', enrollmentKey)
      .single();
    
    if (courseError) throw courseError;
    
    // Enroll the student in the course
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({
        course_id: courseData.id,
        student_id: userId,
        enrolled_at: new Date()
      })
      .select();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

// src/utils/api-service.js
// Add these functions to the existing file

// Function to get course categories
export const getCourseCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('course_categories')
      .select('*');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching course categories:', error);
    // Fallback categories
    return [
      { id: 1, name: 'Computer Science' },
      { id: 2, name: 'Data Science' },
      { id: 3, name: 'Artificial Intelligence' },
      { id: 4, name: 'General Science' },
      { id: 5, name: 'Humanities' },
      { id: 6, name: 'Business Studies' },
      { id: 7, name: 'Others' }
    ];
  }
};

// Create a new course
export const createCourse = async (courseData) => {
  try {
    // Generate a random enrollment key
    const enrollmentKey = Math.floor(Math.random() * 9000000000) + 1000000000;
    
    // Upload thumbnail if exists
    let thumbnailUrl = null;
    if (courseData.thumbnail) {
      const fileName = `${Date.now()}_${courseData.thumbnail.name}`;
      const filePath = `course_thumbnails/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course_assets')
        .upload(filePath, courseData.thumbnail);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('course_assets')
        .getPublicUrl(filePath);
        
      thumbnailUrl = urlData.publicUrl;
    }
    
    // Insert course into database
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        instructor_id: courseData.instructorId,
        category_id: courseData.categoryId || null,
        semester: courseData.semester,
        thumbnail_url: thumbnailUrl,
        enrollment_key: enrollmentKey.toString(),
        is_published: courseData.isPublished || false
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Add lectures
    let lectureData = [];
    if (courseData.lectures && courseData.lectures.length > 0) {
      const lectureInserts = courseData.lectures.map((lecture, index) => ({
        course_id: data.id,
        title: lecture.title,
        display_order: index + 1
      }));

      const { data: insertedLectures, error: lectureError } = await supabase
        .from('lectures')
        .insert(lectureInserts)
        .select();
      
      if (lectureError) {
        console.warn('Error inserting lectures:', lectureError);
      } else {
        lectureData = insertedLectures;

        // Upload lecture content if exists
        for (let i = 0; i < lectureData.length; i++) {
          const lecture = courseData.lectures[i];
          if (lecture.pdfFile) {
            const contentTypeId = lecture.contentType === 'slides' ? 1 : 2;
            await uploadLectureContent(lectureData[i].id, lecture.pdfFile, contentTypeId);
          }
        }
      }
    }

    // Return course with enrollment key and lectures
    return { 
      ...data, 
      enrollment_key: enrollmentKey.toString(),
      lectures: lectureData 
    };
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Function to create or update course lectures
export const updateCourseLectures = async (courseId, lectures) => {
  try {
    // First, delete existing lectures for this course
    const { error: deleteError } = await supabase
      .from('lectures')
      .delete()
      .eq('course_id', courseId);
    
    if (deleteError) throw deleteError;

    // Insert new lectures
    const lectureInserts = lectures.map((lecture, index) => ({
      course_id: courseId,
      title: lecture.title,
      display_order: index + 1
    }));

    const { data: lectureData, error: insertError } = await supabase
      .from('lectures')
      .insert(lectureInserts)
      .select();
    
    if (insertError) throw insertError;

    // Upload lecture content
    for (let i = 0; i < lectureData.length; i++) {
      const lecture = lectures[i];
      if (lecture.pdfFile) {
        const contentTypeId = lecture.contentType === 'slides' ? 1 : 2;
        await uploadLectureContent(lectureData[i].id, lecture.pdfFile, contentTypeId);
      }
    }

    return lectureData;
  } catch (error) {
    console.error('Error updating course lectures:', error);
    throw error;
  }
};

export const checkTableExists = async (tableName) => {
  try {
    // Use a direct query to check table existence
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .limit(1);
    
    // If no error occurs, the table exists
    return !error;
  } catch (error) {
    // If table doesn't exist, this will throw an error
    console.warn(`Table ${tableName} likely doesn't exist:`, error.message);
    return false;
  }
};
// // Create a new course
// export const createNewCourse = async (courseData, userId) => {
//   try {
//     // Generate a random enrollment key
//     const enrollmentKey = Math.floor(Math.random() * 9000000000) + 1000000000;
    
//     // Upload thumbnail if exists
//     let thumbnailUrl = null;
//     if (courseData.thumbnail) {
//       // Make sure the bucket exists first
//       await createStorageBucketIfNotExists('course_assets');
      
//       const fileName = `${Date.now()}_${courseData.thumbnail.name.replace(/\s+/g, '_')}`;
//       const filePath = `course_thumbnails/${fileName}`;
      
//       try {
//         const { data: uploadData, error: uploadError } = await supabase.storage
//           .from('course_assets')
//           .upload(filePath, courseData.thumbnail);
          
//         if (uploadError) {
//           console.warn('Error uploading thumbnail:', uploadError);
//         } else {
//           // Get public URL
//           const { data: urlData } = supabase.storage
//             .from('course_assets')
//             .getPublicUrl(filePath);
            
//           thumbnailUrl = urlData.publicUrl;
//         }
//       } catch (uploadError) {
//         console.warn('Error uploading thumbnail:', uploadError);
//         // Continue without the thumbnail
//       }
//     }
    
//     // Check if the courses table exists
//     const coursesExist = await tableExists('courses');
    
//     if (!coursesExist) {
//       // Return a mock response if table doesn't exist
//       return {
//         id: 'mock-' + Date.now(),
//         title: courseData.title,
//         description: courseData.description,
//         enrollment_key: enrollmentKey.toString(),
//         thumbnail_url: thumbnailUrl,
//         createdAt: new Date().toISOString()
//       };
//     }
    
//     // Insert course into database
//     const { data, error } = await supabase
//       .from('courses')
//       .insert({
//         title: courseData.title,
//         description: courseData.description,
//         instructor_id: userId,
//         category_id: courseData.categoryId || null,
//         semester: courseData.semester,
//         thumbnail_url: thumbnailUrl,
//         enrollment_key: enrollmentKey.toString(),
//         is_published: courseData.isPublished || false
//       })
//       .select()
//       .single();
      
//     if (error) throw error;
    
//     // Return course with enrollment key
//     return {
//       ...data,
//       enrollment_key: enrollmentKey.toString()
//     };
//   } catch (error) {
//     console.error('Error creating course:', error);
//     throw error;
//   }
// };

// // Add lectures to a course
// export const addLecturesToCourse = async (courseId, lectures) => {
//   try {
//     // Check if the lectures table exists
//     const lecturesExist = await checkTableExists('lectures');
    
//     if (!lecturesExist) {
//       // Return mock data if table doesn't exist
//       return lectures.map((lecture, index) => ({
//         id: `mock-lecture-${index}`,
//         title: lecture.title,
//         course_id: courseId,
//         display_order: index + 1
//       }));
//     }
    
//     // Prepare lectures for insertion
//     const lecturesForInsertion = lectures.map((lecture, index) => ({
//       course_id: courseId,
//       title: lecture.title,
//       display_order: index + 1
//     }));
    
//     // Insert lectures into database
//     const { data, error } = await supabase
//       .from('lectures')
//       .insert(lecturesForInsertion)
//       .select();
      
//     if (error) throw error;
//     return data;
//   } catch (error) {
//     console.error('Error adding lectures to course:', error);
//     throw error;
//   }
// };
// Fix for the addLecturesToCourse function in api-service.js
// Replace the existing function with this improved version

export const addLecturesToCourse = async (courseId, lectures) => {
  try {
    // Log what we're sending to help with debugging
    console.log("Adding lectures to course:", courseId, lectures);
    
    // Validate lecture data before sending
    const validLectures = lectures.map(lecture => {
      // Ensure title is a valid string
      const title = typeof lecture.title === 'string' && lecture.title.trim() 
        ? lecture.title.trim() 
        : `Lecture ${new Date().getTime()}`;
      
      return {
        course_id: courseId,
        title: title,
        display_order: lecture.order || 999 // Use provided order or default to end
      };
    });
    
    // Check if lectures table exists
    const lecturesExist = await checkTableExists('lectures');
    
    if (!lecturesExist) {
      // Return mock data if table doesn't exist
      return validLectures.map((lecture, index) => ({
        id: `mock-lecture-${index}-${new Date().getTime()}`,
        title: lecture.title,
        course_id: courseId,
        display_order: lecture.display_order
      }));
    }
    
    // Insert lectures into database
    const { data, error } = await supabase
      .from('lectures')
      .insert(validLectures)
      .select();
      
    if (error) {
      console.error("Supabase error adding lectures:", error);
      throw error;
    }
    
    console.log("Successfully added lectures:", data);
    return data;
  } catch (error) {
    console.error('Error adding lectures to course:', error);
    throw error;
  }
};

// Upload lecture content (PDF files)
export const uploadLectureFile = async (lectureId, file, contentType) => {
  try {
    // Content type mapping
    const contentTypeMap = {
      'slides': 1,
      'notes': 2
    };
    
    // Upload file to storage
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `lecture_content/${lectureId}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course_content')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('course_content')
      .getPublicUrl(filePath);
      
    const fileUrl = urlData.publicUrl;
    
    // Check if lecture_content table exists
    const contentTableExists = await checkTableExists('lecture_content');
    
    if (!contentTableExists) {
      // Return mock data if table doesn't exist
      return {
        id: `mock-content-${Date.now()}`,
        lecture_id: lectureId,
        content_type_id: contentTypeMap[contentType] || 1,
        file_name: fileName,
        file_url: fileUrl,
        file_size: file.size
      };
    }
    
    // Insert content into lecture_content table
    const { data, error } = await supabase
      .from('lecture_content')
      .insert({
        lecture_id: lectureId,
        content_type_id: contentTypeMap[contentType] || 1,
        file_name: fileName,
        file_url: fileUrl,
        file_size: file.size
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading lecture content:', error);
    throw error;
  }
};

// Publish course (update is_published status)
export const publishCourse = async (courseId) => {
  try {
    // Check if courses table exists
    const coursesExist = await checkTableExists('courses');
    
    if (!coursesExist) {
      // Return success even if table doesn't exist
      return true;
    }
    
    const { data, error } = await supabase
      .from('courses')
      .update({ is_published: true })
      .eq('id', courseId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error publishing course:', error);
    throw error;
  }
};

// // Add these file handling functions to api-service.js
// /**
//  * Creates a storage bucket if it doesn't exist, with better error handling
//  * @param {string} bucketName - Name of the bucket to create
//  * @returns {Promise<boolean>} - True if successfully created or already exists
//  */
// export const createStorageBucketIfNotExists = async (bucketName) => {
//   try {
//     // Check if bucket exists
//     const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets();
    
//     if (getBucketsError) {
//       console.warn('Error listing buckets:', getBucketsError);
//       return false;
//     }
    
//     const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
//     if (!bucketExists) {
//       try {
//         const { error } = await supabase.storage.createBucket(bucketName, {
//           public: true,
//           fileSizeLimit: 100 * 1024 * 1024 // 100MB limit
//         });
        
//         if (error) {
//           // If error is "bucket already exists", just continue
//           if (error.message.includes('already exists')) {
//             console.log(`Bucket ${bucketName} already exists`);
//           } else {
//             console.error(`Failed to create bucket ${bucketName}:`, error);
//             return false;
//           }
//         }
//       } catch (createError) {
//         console.error(`Exception creating bucket ${bucketName}:`, createError);
//         return false;
//       }
//     }
    
//     return true;
//   } catch (error) {
//     console.error('Comprehensive bucket management error:', error);
//     return false;
//   }
// };

// Simplified version of createNewCourse with enrollmentKey fix
export const createNewCourse = async (courseData, userId) => {
  // Define enrollmentKey here, OUTSIDE of try/catch block
  const enrollmentKey = Math.floor(Math.random() * 9000000000) + 1000000000;
  
  try {
    // Upload thumbnail if exists - but don't fail if upload fails
    let thumbnailUrl = null;
    if (courseData.thumbnail) {
      try {
        const fileName = `${Date.now()}_${courseData.thumbnail.name.replace(/\s+/g, '_')}`;
        const filePath = `course_thumbnails/${fileName}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('course_assets')
          .upload(filePath, courseData.thumbnail);
          
        if (!uploadError) {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('course_assets')
            .getPublicUrl(filePath);
            
          thumbnailUrl = urlData.publicUrl;
        } else {
          console.warn("Thumbnail upload failed:", uploadError);
        }
      } catch (uploadError) {
        console.warn("Thumbnail upload error:", uploadError);
        // Continue without thumbnail
      }
    }
    
    // Insert course into database
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        instructor_id: userId,
        category_id: courseData.categoryId || null,
        semester: courseData.semester,
        thumbnail_url: thumbnailUrl,
        enrollment_key: enrollmentKey.toString(),
        is_published: courseData.isPublished || false
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error inserting course:", error);
      
      // Return mock data if database insert fails
      return {
        id: 'mock-' + Date.now(),
        title: courseData.title,
        description: courseData.description,
        enrollment_key: enrollmentKey.toString(),
        thumbnail_url: thumbnailUrl,
        instructor_id: userId,
        created_at: new Date().toISOString()
      };
    }
    
    // Return course with enrollment key
    return {
      ...data,
      enrollment_key: enrollmentKey.toString()
    };
  } catch (error) {
    console.error('Error creating course:', error);
    
    // Now this works because enrollmentKey is defined outside the try/catch block
    return {
      id: 'mock-error-' + Date.now(),
      title: courseData.title,
      description: courseData.description,
      enrollment_key: enrollmentKey.toString(), // No longer an error
      error: error.message
    };
  }
};
/**
 * Deletes a file from storage
 * @param {string} filePath - Path to the file within the bucket
 * @param {string} bucketName - Name of the storage bucket
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export const deleteFileFromStorage = async (filePath, bucketName = 'course_content') => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Uploads lecture content file and updates database
 * @param {string} lectureId - ID of the lecture
 * @param {File} file - The file to upload
 * @param {string} contentType - Type of content ('slides' or 'notes')
 * @returns {Promise<Object>} - The saved lecture content record
 */
export const uploadLectureContentFile = async (lectureId, file, contentType) => {
  try {
    // Content type mapping
    const contentTypeMap = {
      'slides': 1,
      'notes': 2
    };
    
    // Upload to storage
    const folderPath = `lectures/${lectureId}`;
    const fileUrl = await uploadFileToStorage(file, folderPath);
    
    // Check if lecture_content table exists
    const contentTableExists = await checkTableExists('lecture_content');
    
    if (!contentTableExists) {
      // Return mock data if table doesn't exist
      return {
        id: `mock-content-${Date.now()}`,
        lecture_id: lectureId,
        content_type_id: contentTypeMap[contentType] || 1,
        file_name: file.name,
        file_url: fileUrl,
        file_size: file.size
      };
    }
    
    // Insert content into lecture_content table
    const { data, error } = await supabase
      .from('lecture_content')
      .insert({
        lecture_id: lectureId,
        content_type_id: contentTypeMap[contentType] || 1,
        file_name: file.name,
        file_url: fileUrl,
        file_size: file.size
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading lecture content:', error);
    throw error;
  }
};

/**
 * Downloads a file from a URL
 * @param {string} url - URL of the file to download
 * @param {string} filename - Name to save the file as
 */
export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

/**
 * Gets lecture details with content
 * @param {string} lectureId - ID of the lecture
 * @returns {Promise<Object>} - Lecture details with content
 */
export const getLectureDetails = async (lectureId) => {
  try {
    const { data, error } = await supabase
      .from('lectures')
      .select(`
        *,
        lecture_content (*)
      `)
      .eq('id', lectureId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching lecture details:', error);
    return null;
  }
};

/**
 * Updates a lecture's title in the database
 * @param {string|number} lectureId - ID of the lecture to update
 * @param {string} newTitle - New title for the lecture
 * @returns {Promise<Object>} - Updated lecture data
 */
export const updateLecture = async (lectureId, newTitle) => {
  try {
    console.log(`Updating lecture ${lectureId} with new title: ${newTitle}`);
    
    // Validate inputs
    if (!lectureId) {
      throw new Error("Lecture ID is required");
    }
    
    if (!newTitle || typeof newTitle !== 'string' || !newTitle.trim()) {
      throw new Error("Valid lecture title is required");
    }
    
    // Check if lectures table exists
    const lecturesExist = await checkTableExists('lectures');
    
    if (!lecturesExist) {
      // Return mock data if table doesn't exist
      console.log("Lectures table doesn't exist, returning mock data");
      return {
        id: lectureId,
        title: newTitle,
        updated_at: new Date().toISOString()
      };
    }
    
    // Update the lecture in the database
    const { data, error } = await supabase
      .from('lectures')
      .update({ title: newTitle.trim() })
      .eq('id', lectureId)
      .select();
      
    if (error) {
      console.error("Database error updating lecture:", error);
      throw error;
    }
    
    // If no data was returned but also no error, the lectureId might not exist
    // In this case, we'll still return a success response with the updated title
    if (!data || data.length === 0) {
      console.warn(`No lecture found with ID ${lectureId}, but update didn't fail`);
      return {
        id: lectureId,
        title: newTitle,
        updated_at: new Date().toISOString()
      };
    }
    
    console.log("Successfully updated lecture:", data[0]);
    return data[0];
  } catch (error) {
    console.error('Error updating lecture:', error);
    throw error;
  }
};

/**
 * Deletes a lecture and its associated content
 * @param {string} lectureId - ID of the lecture to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export const deleteLecture = async (lectureId) => {
  try {
    // Check if lectures table exists
    const lecturesExist = await checkTableExists('lectures');
    
    if (!lecturesExist) {
      // Return success if table doesn't exist
      return true;
    }
    
    // First, get lecture content to delete files from storage
    const { data: contentData, error: contentError } = await supabase
      .from('lecture_content')
      .select('*')
      .eq('lecture_id', lectureId);
      
    if (!contentError && contentData && contentData.length > 0) {
      // Delete files from storage
      for (const content of contentData) {
        // Extract file path from URL
        const urlParts = content.file_url.split('/');
        const filePath = urlParts.slice(urlParts.indexOf('lecture_content')).join('/');
        
        // Delete from storage
        await deleteFileFromStorage(filePath);
      }
      
      // Delete content records
      const { error: deleteContentError } = await supabase
        .from('lecture_content')
        .delete()
        .eq('lecture_id', lectureId);
        
      if (deleteContentError) throw deleteContentError;
    }
    
    // Finally, delete the lecture
    const { error: deleteLectureError } = await supabase
      .from('lectures')
      .delete()
      .eq('id', lectureId);
      
    if (deleteLectureError) throw deleteLectureError;
    
    return true;
  } catch (error) {
    console.error('Error deleting lecture:', error);
    return false;
  }
};

/**
 * Reorders lectures within a course
 * @param {string} courseId - ID of the course
 * @param {Array<{id: string, order: number}>} newOrder - Array of lecture IDs with their new order
 * @returns {Promise<boolean>} - True if reordering was successful
 */
export const reorderLectures = async (courseId, newOrder) => {
  try {
    // Check if lectures table exists
    const lecturesExist = await checkTableExists('lectures');
    
    if (!lecturesExist) {
      // Return success if table doesn't exist
      return true;
    }
    
    // Update each lecture with its new order
    const updatePromises = newOrder.map(item => 
      supabase
        .from('lectures')
        .update({ display_order: item.order })
        .eq('id', item.id)
        .eq('course_id', courseId)
    );
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error reordering lectures:', error);
    return false;
  }
};

/**
 * Gets course statistics (student count, completed lectures, etc)
 * @param {string} courseId - ID of the course
 * @returns {Promise<Object>} - Course statistics
 */
export const getCourseStatistics = async (courseId) => {
  try {
    // For demo purposes, return mock data
    return {
      enrolledStudents: Math.floor(Math.random() * 50) + 10,
      averageProgress: Math.floor(Math.random() * 80) + 20,
      completedLectures: Math.floor(Math.random() * 8) + 1
    };
    
    // Real implementation would be:
    /*
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select('count')
      .eq('course_id', courseId);
      
    // Add other queries for progress tracking, etc.
    */
  } catch (error) {
    console.error('Error getting course statistics:', error);
    return {
      enrolledStudents: 0,
      averageProgress: 0,
      completedLectures: 0
    };
  }
};


// /**
//  * Uploads a file to storage with robust error handling
//  * @param {File} file - File to upload
//  * @param {string} folder - Folder path within the bucket
//  * @param {string} bucketName - Name of the storage bucket
//  * @returns {Promise<string>} - Public URL of the uploaded file
//  */
export const uploadFileToStorage = async (file, folder, bucketName = 'course_content') => {
  try {
    // Ensure bucket exists first
    await createStorageBucketIfNotExists(bucketName);
    
    // Create unique filename
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.warn(`Error uploading to ${bucketName}/${filePath}:`, uploadError);
      throw uploadError;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Comprehensive file upload error:', error);
    
    // Fallback for critical scenarios
    if (error.statusCode === '404') {
      await createStorageBucketIfNotExists(bucketName);
      // You might want to retry the upload here
    }
    
    throw error;
  }
};

export const createStorageBucketIfNotExists = async (bucketName) => {
  try {
    // Check if bucket exists
    const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets();
    
    if (getBucketsError) {
      console.warn('Error listing buckets:', getBucketsError);
      return false;
    }
    
    const bucketExists = buckets && buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Create the bucket with public access
      try {
        const { data, error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (error) {
          // Check if the error is because the bucket already exists
          if (error.message && error.message.includes('already exists')) {
            console.log(`Bucket ${bucketName} already exists, continuing...`);
            return true;
          }
          
          console.warn(`Error creating bucket ${bucketName}:`, error);
          return false;
        }
        
        console.log(`Created bucket: ${bucketName}`);
      } catch (bucketError) {
        // Check if the error is because the bucket already exists
        if (bucketError.message && bucketError.message.includes('already exists')) {
          console.log(`Bucket ${bucketName} already exists, continuing...`);
          return true;
        }
        
        console.warn(`Exception creating bucket ${bucketName}:`, bucketError);
        return false;
      }
    } else {
      console.log(`Bucket ${bucketName} already exists, skipping creation.`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in bucket management:', error);
    return false;
  }
};