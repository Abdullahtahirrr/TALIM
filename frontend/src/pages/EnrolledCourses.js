// src/pages/EnrolledCourses.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import SimpleFooter from "../components/SimpleFooter";
import DialogBox from "../components/DialogBox";
import Button from "../components/Button";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import courseImage from "../assets/course_image.jpeg";
import { tableExists, getUserProfile } from "../utils/api-service";
import { useAuth } from "../utils/authContext";
import { supabase } from "../supabaseClient";
import "../styles/EnrolledCourses.css";

const EnrolledCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for courses data
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [profile, setProfile] = useState(null);

  // State for enrollment dialog
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [enrollmentKey, setEnrollmentKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  
  // Sample course data for fallback
  const sampleCourses = [
    {
      id: 1,
      title: "Deep Learning",
      instructor: "Seemab Latif",
      university: "NUST",
      image: courseImage,
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      instructor: "Seemab Latif",
      university: "NUST",
      image: courseImage,
    },
    {
      id: 3,
      title: "Data Structures and Algorithms",
      instructor: "Seemab Latif",
      university: "NUST",
      image: courseImage,
    },
  ];
  
  // useEffect(() => {
  //   const fetchCourses = async () => {
  //     try {
  //       if (user) {
  //         // Get user profile
  //         const profileData = await getUserProfile(user.id);
  //         setProfile(profileData);
          
  //         // Check if courses table exists
  //         const coursesExist = await tableExists('courses');
          
  //         if (coursesExist) {
  //           // Get all available courses that the user is not enrolled in
  //           const { data: enrolledCoursesIds, error: enrolledError } = await supabase
  //             .from('course_enrollments')
  //             .select('course_id')
  //             .eq('student_id', user.id);
              
  //           if (enrolledError) throw enrolledError;
            
  //           const enrolledIds = enrolledCoursesIds.map(item => item.course_id);
  //           console.log("Enrolled course IDs:", enrolledIds);
            
  //           // Get all published courses
  //           const { data: allCourses, error: coursesError } = await supabase
  //             .from('courses')
  //             .select(`
  //               id,
  //               title,
  //               description,
  //               thumbnail_url,
  //               instructor_id,
  //               profiles:instructor_id (
  //                 first_name,
  //                 last_name
  //               )
  //             `)
  //             .eq('is_published', true)
  //             .not('id', 'in', enrolledIds.length > 0 ? `(${enrolledIds.join(',')})` : '(0)');
  //             console.log("All courses:", allCourses);
  //           if (coursesError) throw coursesError;
            
  //           // Format the courses for display
  //           const formattedCourses = allCourses.map(course => ({
  //             id: course.id,
  //             title: course.title,
  //             instructor: course.profiles ? `${course.profiles.first_name} ${course.profiles.last_name}` : "Unknown Instructor",
  //             university: "NUST", // Can be updated if you add this to user_details
  //             image: course.thumbnail_url || courseImage
  //           }));
            
  //           setCourses(formattedCourses);
  //         } else {
  //           // Fallback to sample data
  //           setCourses(sampleCourses);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching courses:", error);
  //       setCourses(sampleCourses); // Fallback to sample data
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
    
  //   fetchCourses();
  // }, [user]);
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (user) {
          // Get user profile
          const profileData = await getUserProfile(user.id);
          setProfile(profileData);
  
          // Check if courses table exists
          const coursesExist = await tableExists("courses");
  
          if (coursesExist) {
            // Get all enrolled course IDs
            const { data: enrolledCoursesIds, error: enrolledError } = await supabase
              .from("course_enrollments")
              .select("course_id")
              .eq("student_id", user.id);
  
            if (enrolledError) throw enrolledError;
  
            const enrolledCourseIDs = enrolledCoursesIds?.map((item) => item.course_id) ?? [];
  
            if (enrolledCourseIDs.length === 0) {
              console.warn("No enrolled courses found, skipping filter.");
            }
  
            // Construct query for fetching courses
            let query = supabase
              .from("courses")
              .select(
                `
                id,
                title,
                description,
                thumbnail_url,
                instructor_id,
                profiles:instructor_id (
                  first_name,
                  last_name
                )
              `
              )
              .eq("is_published", true);
  
            // Apply filtering only if there are enrolled courses
            if (enrolledCourseIDs.length > 0) {
              query = query.not("id", "in", `(${enrolledCourseIDs.join(",")})`);
            }
  
            const { data: allCourses, error: coursesError } = await query;
  
            if (coursesError) throw coursesError;
  
            console.log("All courses:", allCourses);
  
            // Format the courses for display
            const formattedCourses = allCourses.map((course) => ({
              id: course.id,
              title: course.title,
              instructor: course.profiles
                ? `${course.profiles.first_name} ${course.profiles.last_name}`
                : "Unknown Instructor",
              university: "NUST", // Can be updated if you add this to user_details
              image: course.thumbnail_url || courseImage,
            }));
  
            setCourses(formattedCourses);
          } else {
            // Fallback to sample data
            setCourses(sampleCourses);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses(sampleCourses); // Fallback to sample data
      } finally {
        setLoading(false);
      }
    };
  
    fetchCourses();
  }, [user]);
  
  
  // Handle enrollment button click
  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setEnrollmentKey("");
    setErrorMessage("");
    setIsEnrollDialogOpen(true);
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1);
  };

  // Handle enrollment submission
  const handleEnrollSubmit = async () => {
    if (!enrollmentKey) {
      setErrorMessage("Please enter an enrollment key");
      return;
    }
    
    setEnrolling(true);
    setErrorMessage("");
    
    try {
      // Check if the courses table exists
      const coursesExist = await tableExists('courses');
      
      if (coursesExist) {
        // Verify the enrollment key
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('id')
          .eq('enrollment_key', enrollmentKey)
          .single();
          
        if (courseError) {
          if (courseError.code === 'PGRST116') {
            throw new Error("Invalid enrollment key. Please try again.");
          }
          throw courseError;
        }
        
        // Enroll the student
        const { error: enrollError } = await supabase
          .from('course_enrollments')
          .insert({
            course_id: course.id,
            student_id: user.id,
            enrolled_at: new Date()
          });
          
        if (enrollError) {
          if (enrollError.code === '23505') { // Unique violation
            throw new Error("You are already enrolled in this course.");
          }
          throw enrollError;
        }
        
        // Redirect to course content page
        navigate(`/StudentCourseContent/${course.id}`);
      } else {
        // If the tables don't exist, just simulate enrollment with the sample course
        if (enrollmentKey === "123456") { // Example key for sample course
          navigate(`/StudentCourseContent/${selectedCourse.id}`);
        } else {
          throw new Error("Invalid enrollment key. Please try again.");
        }
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      setErrorMessage(error.message);
    } finally {
      setEnrolling(false);
    }
  };
  
  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render enrollment dialog content
  const renderEnrollmentDialogContent = () => (
    <div className="enrollment-dialog-content">
      <p>Please enter the enrollment key to access this course.</p>
      <input
        type="text"
        value={enrollmentKey}
        onChange={(e) => setEnrollmentKey(e.target.value)}
        placeholder="Enrollment Key"
        className="enrollment-key-input"
      />
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="enrollment-actions">
        <Button variant="dark" onClick={handleEnrollSubmit} disabled={enrolling}>
          {enrolling ? "Enrolling..." : "Enroll"}
        </Button>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="enrolled-courses-page">
      <Navbar />
      
      <div className="enrolled-courses-content">
        <div className="header-section">
          <button className="back-button" onClick={handleBackClick}>
            <FaArrowLeft /> <span>Back to Courses</span>
          </button>
          <h1>COURSES</h1>
        </div>
        
        <div className="search-section">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search courses..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="courses-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                image={course.image}
                title={course.title}
                instructor={course.instructor}
                university={course.university}
                buttonText="Enroll"
                onButtonClick={() => handleEnrollClick(course)}
              />
            ))
          ) : (
            <div className="no-courses-message">
              <p>No courses found matching your search.</p>
            </div>
          )}
        </div>
      </div>
      
      <SimpleFooter />
      
      {/* Enrollment Dialog */}
      <DialogBox
        isOpen={isEnrollDialogOpen}
        title={selectedCourse ? `${selectedCourse.title} - Enrollment` : "Course Enrollment"}
        onClose={() => setIsEnrollDialogOpen(false)}
      >
        {renderEnrollmentDialogContent()}
      </DialogBox>
    </div>
  );
};

export default EnrolledCourses;