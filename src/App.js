import  { BrowserMultiFormatReader }  from '@zxing/browser';
import { useEffect, useRef, useState} from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [bookInfo, setBookInfo] = useState(null);
  const [barcode, setBarcode] = useState(null);
  const [loading, setLoading] = useState(false);
  const codeReaderRef = useRef(null);

  const startScanner = () => {
    if (!videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err, controls) => {
        if (!controlsRef.current) {
          controlsRef.current = controls; 
        }

        if (result && !barcode) {
          console.log("Scanned result:", result.getText());
          const isbn = result.getText();
          setBarcode(isbn);
          setLoading(true);

          controls.stop();

          fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.totalItems > 0) {
                const book = data.items[0].volumeInfo;
                setBookInfo(book);
                console.log("📚 Book Info:", data.items[0].volumeInfo);
              } else {
                console.log("❌ No book found for ISBN:", isbn);
              }
            })
            .catch((err) => {
              console.error("🔴 Error fetching from Google Books API:", err);
            })
            .finally(() => {
              setLoading(false)
            });
        }

        if (err && err.name !== 'NotFoundException') {
          console.error("Scan error:", err);
          }
        }
      );
    };
  useEffect(() => {
    requestAnimationFrame(startScanner);

    return () => {
      if (controlsRef.current) {
      controlsRef.current.stop(); // Stop the scanner on unmount
      }
    };
  }, []);

  const handleScanAgain = () => {
    // Reset states
    setBarcode(null);
    setBookInfo(null);
    setLoading(false);

    // Start the scanner again
    requestAnimationFrame(startScanner);
  };

  return (
    <div className="App">
      <h1>Barcode Scanner</h1>
      {barcode ? (
        <div className="result">
          {loading ? (
            <p>Fetching book information...</p>
          ) : bookInfo ? (
            <div className="book-info">
              <h2>{bookInfo.title}</h2>
              {bookInfo.authors && <p><strong>Author(s):</strong> {bookInfo.authors.join(', ')}</p>}
              {bookInfo.publisher && <p><strong>Publisher:</strong> {bookInfo.publisher}</p>}
              {bookInfo.publishedDate && <p><strong>Published Date:</strong> {bookInfo.publishedDate}</p>}
              {bookInfo.description && <p><strong>Description:</strong> {bookInfo.description}</p>}
              {bookInfo.imageLinks && bookInfo.imageLinks.thumbnail ? (
                <img src={bookInfo.imageLinks.thumbnail} alt={`${bookInfo.title} cover`} />
              ) : (
                <img src="/placeholder.png" alt="No cover available" />
              )}
            </div>
            
          ) : (
            <p>No book information available.</p>
          )}
          <button onClick={handleScanAgain}>Scan Again</button>
        </div>
      ) : (
        <div className="scanner">
          <div/>
            <video ref={videoRef} autoPlay muted playsInline></video>
        </div>
      )}
    </div>
  );
}

export default App;
