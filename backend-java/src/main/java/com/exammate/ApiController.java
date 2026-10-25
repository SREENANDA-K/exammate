package com.exammate;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import java.security.SecureRandom;


import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.nio.file.*;
import java.time.*;
import java.util.*;

@RestController
public class ApiController {
  private final JdbcTemplate db;
  
private final JavaMailSender mailSender;
private final SecureRandom secureRandom = new SecureRandom();

  private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder(10);
  @Value("${app.jwt.secret}") private String jwtSecret;
  @Value("${app.upload-dir}") private String uploadDir;
  private final RowMapper<Map<String,Object>> row = (rs,n) -> {
    var m = new LinkedHashMap<String,Object>(); var md=rs.getMetaData();
    for(int i=1;i<=md.getColumnCount();i++) m.put(md.getColumnLabel(i),rs.getObject(i)); return m;
  };
  
public ApiController(JdbcTemplate db, JavaMailSender mailSender) {
    this.db = db;
    this.mailSender = mailSender;
    ensureExamIdColumn();
    ensureOtpTable();
}

private void ensureOtpTable() {
    db.execute("""
        CREATE TABLE IF NOT EXISTS email_verification_otps (
            email VARCHAR(320) PRIMARY KEY,
            otp_hash VARCHAR(100) NOT NULL,
            expires_at BIGINT NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0,
            last_sent_at BIGINT NOT NULL
        )
        """);
}


private void ensureExamIdColumn() {
    var columns = db.queryForList("PRAGMA table_info(\"StudySession\")");

    boolean exists = columns.stream().anyMatch(column ->
        "exam_id".equalsIgnoreCase(String.valueOf(column.get("name")))
    );

    if (!exists) {
        db.execute("ALTER TABLE \"StudySession\" ADD COLUMN exam_id TEXT");
    }
}

  private Map<String,Object> one(String sql,Object... a) { var l=db.query(sql,row,a); return l.isEmpty()?null:l.get(0); }
  private List<Map<String,Object>> many(String sql,Object... a) { return db.query(sql,row,a); }
  private String uid(HttpServletRequest r) {
    var h=r.getHeader("Authorization");
    if(h==null || !h.startsWith("Bearer ")) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Authentication required. No token provided.");
    try { if(jwtSecret==null || jwtSecret.length()<32) throw new IllegalStateException();
      return Jwts.parser().verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes())).build().parseSignedClaims(h.substring(7)).getPayload().get("userId",String.class);
    } catch(Exception e) { if(jwtSecret==null || jwtSecret.length()<32) throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Server authentication configuration error."); throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Invalid or expired token."); }
  }
  private String token(String id) { if(jwtSecret==null || jwtSecret.length()<32) throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"JWT_SECRET must contain at least 32 characters."); return Jwts.builder().claim("userId",id).issuedAt(new Date()).expiration(Date.from(Instant.now().plus(7,java.time.temporal.ChronoUnit.DAYS))).signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes())).compact(); }
  private Map<String,Object> body(Map<String,Object> b,String key) { return b==null?Map.of():b; }
  private String s(Map<String,Object> b,String k) { var v=b.get(k); return v==null?null:String.valueOf(v); }
  private Map<String,Object> msg(String text) { return Map.of("message",text); }
  private void requireOwner(String sql,String id,String user,String message) { if(one(sql,id,user)==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND,message); }
  private Object date(String s) { return s==null?null:OffsetDateTime.parse(s).toLocalDateTime(); }
  private void savePdfTopics(String syllabusId,String subject,String text) {
    String content=text.replace("\r","\n"); var sy=java.util.regex.Pattern.compile("(?i)\\bSYLLABUS\\b").matcher(content); if(sy.find())content=content.substring(sy.start());
    String subjectId=UUID.randomUUID().toString(); db.update("insert into \"Subject\"(id,syllabus_id,name) values(?,?,?)",subjectId,syllabusId,subject);
    var blocks=new ArrayList<String[]>(); String name=null; var desc=new StringBuilder();
    for(String raw:content.split("\\n")){String line=raw.trim();var m=java.util.regex.Pattern.compile("(?i)^(module|unit|chapter|part)\\s*([0-9]+|[ivxlcdm]+)\\s*[:.\\-]?\\s*(.*)$").matcher(line);if(m.matches()){if(name!=null)blocks.add(new String[]{name,desc.toString()});name=m.group(1)+" "+m.group(2)+(m.group(3).isBlank()?"":": "+m.group(3).trim());desc.setLength(0);}else if(name!=null&&!line.isBlank())desc.append(' ').append(line);}
    if(name!=null)blocks.add(new String[]{name,desc.toString()});
    if(blocks.isEmpty())blocks.add(new String[]{"Module 1",content}); int n=0;
    for(var block:blocks){String moduleId=UUID.randomUUID().toString();db.update("insert into \"Module\"(id,subject_id,name) values(?,?,?)",moduleId,subjectId,block[0]);var seen=new HashSet<String>();String normalized=block[1].replaceAll("\\s+-\\s+|\\s*;\\s*|\\s*\\|\\s*","|");for(String part:normalized.split("[|:]")){String topic=part.replaceAll("^[0-9.\\-*\\s]+","").replaceAll("\\s+"," ").trim();if(topic.length()<3||topic.length()>150||topic.matches("\\d+")||!seen.add(topic.toLowerCase()))continue; if(topic.toLowerCase().matches("(semester|course code|credits?|contact hours|text books?|reference books?).*"))continue;db.update("insert into \"Topic\"(id,module_id,name,status) values(?,?,?,'PENDING')",UUID.randomUUID().toString(),moduleId,topic);n++;}}
    if(n==0){String mid=UUID.randomUUID().toString();db.update("insert into \"Module\"(id,subject_id,name) values(?,?,?)",mid,subjectId,"Module 1");db.update("insert into \"Topic\"(id,module_id,name,status) values(?,?,?,'PENDING')",UUID.randomUUID().toString(),mid,"Syllabus topics could not be automatically detected");}
  }
 
private int generatePrep(String userId, String examId) {
    var exams = examId == null
        ? many(
            "SELECT e.id, e.subject_id, e.exam_date, s.name AS subject_name " +
            "FROM \"Exam\" e JOIN \"Subject\" s ON s.id = e.subject_id " +
            "WHERE e.user_id = ? AND date(e.exam_date) >= date('now') " +
            "ORDER BY e.exam_date",
            userId
        )
        : many(
            "SELECT e.id, e.subject_id, e.exam_date, s.name AS subject_name " +
            "FROM \"Exam\" e JOIN \"Subject\" s ON s.id = e.subject_id " +
            "WHERE e.user_id = ? AND e.id = ? " +
            "AND date(e.exam_date) >= date('now')",
            userId, examId
        );

    int totalCount = 0;

    for (var exam : exams) {
        String currentExamId = String.valueOf(exam.get("id"));
        String subjectId = String.valueOf(exam.get("subject_id"));

        var topics = many(
            "SELECT t.id FROM \"Topic\" t " +
            "JOIN \"Module\" m ON m.id = t.module_id " +
            "WHERE m.subject_id = ? ORDER BY m.id, t.id",
            subjectId
        );

        if (topics.isEmpty()) {
            continue;
        }

        // Regenerate only this exam's pending preparation sessions.
        db.update(
            "DELETE FROM \"StudySession\" " +
            "WHERE user_id = ? AND exam_id = ? " +
            "AND mode = 'EXAM_PREP' AND status = 'PENDING' " +
            "AND date >= date('now')",
            userId, currentExamId
        );

        int examCount = 0;

        for (int day = 0; day < 14; day++) {
            var active = one(
                "SELECT CASE WHEN date('now', '+' || ? || ' days') " +
                "< date(?) THEN 1 ELSE 0 END AS ok",
                day, exam.get("exam_date")
            );

            if (active == null ||
                !"1".equals(String.valueOf(active.get("ok")))) {
                break;
            }

            var topic = topics.get(day % topics.size());

            String[][] slots = {
                {"14:00", "15:30"},
                {"20:00", "21:30"}
            };

            for (String[] slot : slots) {
                db.update(
                    "INSERT INTO \"StudySession\" " +
                    "(id, user_id, topic_id, exam_id, date, " +
                    "start_time, end_time, mode, status) " +
                    "VALUES (?, ?, ?, ?, " +
                    "date('now', '+' || ? || ' days'), ?, ?, " +
                    "'EXAM_PREP', 'PENDING')",
                    UUID.randomUUID().toString(),
                    userId,
                    topic.get("id"),
                    currentExamId,
                    day,
                    slot[0],
                    slot[1]
                );

                examCount++;
            }
        }

        if (examCount > 0) {
            totalCount += examCount;

            db.update(
                "INSERT INTO \"Notification\" " +
                "(id, user_id, title, message, type) " +
                "VALUES (?, ?, ?, ?, ?)",
                UUID.randomUUID().toString(),
                userId,
                "Exam Preparation Active: " + exam.get("subject_name"),
                "Generated " + examCount +
                    " preparation sessions for your exam.",
                "EXAM"
            );
        }
    }

    return totalCount;
}

  private Map<String,Object> syllabusTree(String id) { var y=one("select * from \"Syllabus\" where id=?",id); if(y==null)return null; var subs=many("select * from \"Subject\" where syllabus_id=?",id); for(var sub:subs){var mods=many("select * from \"Module\" where subject_id=?",sub.get("id")); for(var mod:mods)mod.put("topics",many("select * from \"Topic\" where module_id=?",mod.get("id"))); sub.put("modules",mods);} y.put("subjects",subs); return y; }

  @GetMapping("/api/health") public Map<String,Object> health() { return Map.of("status","ok","app","ExamMate Backend API","timestamp",Instant.now().toString()); }
  
@PostMapping("/api/auth/send-otp")
public Map<String, Object> sendOtp(@RequestBody Map<String, Object> b) {
    String email = s(b, "email");

    if (email == null ||
        !email.trim().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Enter a valid email address."
        );
    }

    email = email.trim().toLowerCase(Locale.ROOT);

    if (one("SELECT id FROM \"User\" WHERE lower(email)=?", email) != null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "An account with this email already exists."
        );
    }

    long now = System.currentTimeMillis();

    var previous = one(
        "SELECT last_sent_at FROM email_verification_otps WHERE email=?",
        email
    );

    if (previous != null &&
        now - ((Number) previous.get("last_sent_at")).longValue() < 60_000) {
        throw new ResponseStatusException(
            HttpStatus.TOO_MANY_REQUESTS,
            "Please wait one minute before requesting another code."
        );
    }

    String code = String.format("%06d", secureRandom.nextInt(1_000_000));

    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(email);
    message.setSubject("Your ExamMate verification code");
    message.setText(
        "Your ExamMate verification code is: " + code +
        "\n\nThis code expires in 5 minutes." +
        "\nIf you did not request this code, you can ignore this email."
    );

   
try {
    mailSender.send(message);
} catch (Exception e) {
    e.printStackTrace();
    throw new ResponseStatusException(
        HttpStatus.SERVICE_UNAVAILABLE,
        "Unable to send the verification email. Please try again later."
    );
}


    db.update("""
        INSERT INTO email_verification_otps
            (email, otp_hash, expires_at, attempts, last_sent_at)
        VALUES (?, ?, ?, 0, ?)
        ON CONFLICT(email) DO UPDATE SET
            otp_hash=excluded.otp_hash,
            expires_at=excluded.expires_at,
            attempts=0,
            last_sent_at=excluded.last_sent_at
        """,
        email,
        passwords.encode(code),
        now + 300_000,
        now
    );

    return msg("Verification code sent. Check your email.");
}

@Transactional
@PostMapping("/api/auth/register")
@ResponseStatus(HttpStatus.CREATED)
public Map<String, Object> register(@RequestBody Map<String, Object> b) {
    String name = s(b, "name");
    String email = s(b, "email");
    String pass = s(b, "password");
    String otp = s(b, "otp");

    if (name == null || name.isBlank() ||
        email == null || pass == null || otp == null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Name, email, password and verification code are required."
        );
    }

    email = email.trim().toLowerCase(Locale.ROOT);
    name = name.trim();

    if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "Enter a valid email address."
        );
    }

    if (pass.length() < 6) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Password must be at least 6 characters long."
        );
    }

    if (one("SELECT id FROM \"User\" WHERE lower(email)=?", email) != null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "An account with this email already exists."
        );
    }

    var record = one(
        "SELECT * FROM email_verification_otps WHERE email=?",
        email
    );

    if (record == null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Request a verification code first."
        );
    }

    long now = System.currentTimeMillis();
    long expiry = ((Number) record.get("expires_at")).longValue();
    int attempts = ((Number) record.get("attempts")).intValue();

    if (now > expiry) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Verification code expired. Request a new code."
        );
    }

    if (attempts >= 5) {
        throw new ResponseStatusException(
            HttpStatus.TOO_MANY_REQUESTS,
            "Too many incorrect attempts. Request a new code."
        );
    }

    boolean validOtp = otp.matches("\\d{6}") &&
        passwords.matches(otp, String.valueOf(record.get("otp_hash")));

    if (!validOtp) {
        db.update(
            "UPDATE email_verification_otps SET attempts=attempts+1 WHERE email=?",
            email
        );

        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Incorrect verification code."
        );
    }

    String id = UUID.randomUUID().toString();

    db.update(
        "INSERT INTO \"User\"(id,name,email,password_hash) VALUES(?,?,?,?)",
        id, name, email, passwords.encode(pass)
    );

    db.update(
        """
        INSERT INTO "StudentProfile"
            (id,user_id,qualification,course,daily_study_hours,created_at,updated_at)
        VALUES (?,?,'Undergraduate','General Studies',3.0,
                CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
        """,
        UUID.randomUUID().toString(), id
    );

    db.update(
        "DELETE FROM email_verification_otps WHERE email=?",
        email
    );

    return Map.of(
        "message", "Registration successful.",
        "token", token(id),
        "user", Map.of("id", id, "name", name, "email", email)
    );
}

  @PostMapping("/api/auth/login") public Map<String,Object> login(@RequestBody Map<String,Object>b) {
    String email=s(b,"email"),pass=s(b,"password"); if(email==null||pass==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Email and password are required.");
    var u=one("select id,name,email,password_hash from \"User\" where email=?",email);
    if(u==null||!passwords.matches(pass,String.valueOf(u.get("password_hash")))) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Invalid email or password.");
    return Map.of("message","Login successful.","token",token(String.valueOf(u.get("id"))),"user",Map.of("id",u.get("id"),"name",u.get("name"),"email",u.get("email"),"profile",Optional.ofNullable(one("select * from \"StudentProfile\" where user_id=?",u.get("id"))).orElse(Map.of())));
  }
  @GetMapping("/api/auth/me") public Map<String,Object> me(HttpServletRequest r) { var u=one("select id,name,email,created_at from \"User\" where id=?",uid(r)); if(u==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"User not found."); u.put("profile",one("select * from \"StudentProfile\" where user_id=?",u.get("id"))); return Map.of("user",u); }

  @GetMapping("/api/profile") public Map<String,Object> profile(HttpServletRequest r) { var p=one("select * from \"StudentProfile\" where user_id=?",uid(r)); if(p==null) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Profile not found."); return Map.of("profile",p); }
  @PutMapping("/api/profile") public Map<String,Object> updateProfile(HttpServletRequest r,@RequestBody Map<String,Object>b) {
    String user=uid(r); var old=one("select * from \"StudentProfile\" where user_id=?",user); String id=old==null?UUID.randomUUID().toString():String.valueOf(old.get("id"));
    String q=old==null?"insert into \"StudentProfile\"(id,user_id,qualification,course,institution,daily_study_hours,created_at,updated_at) values(?,?,?,?,?,? ,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)":"update \"StudentProfile\" set qualification=?,course=?,institution=?,daily_study_hours=?,updated_at=CURRENT_TIMESTAMP where user_id=?";
    Object qual=b.getOrDefault("qualification",old==null?"Undergraduate":old.get("qualification")), course=b.getOrDefault("course",old==null?"General Studies":old.get("course")), inst=b.getOrDefault("institution",old==null?null:old.get("institution")), hours=b.getOrDefault("daily_study_hours",old==null?3.0:old.get("daily_study_hours"));
    if(old==null) db.update(q,id,user,qual,course,inst,hours); else db.update(q,qual,course,inst,hours,user);
    return Map.of("message","Profile updated successfully.","profile",one("select * from \"StudentProfile\" where user_id=?",user));
  }

  @GetMapping("/api/syllabus") public Map<String,Object> syllabi(HttpServletRequest r) { var ys=many("select id from \"Syllabus\" where user_id=? order by upload_date desc",uid(r)); return Map.of("syllabi",ys.stream().map(y->syllabusTree(""+y.get("id"))).toList()); }
  @GetMapping("/api/syllabus/subjects") public Map<String,Object> subjects(HttpServletRequest r) { return Map.of("subjects",many("select s.* from \"Subject\" s join \"Syllabus\" y on y.id=s.syllabus_id where y.user_id=?",uid(r))); }
  @GetMapping("/api/syllabus/topics") public Map<String,Object> topics(HttpServletRequest r) { return Map.of("topics",many("select t.* from \"Topic\" t join \"Module\" m on m.id=t.module_id join \"Subject\" s on s.id=m.subject_id join \"Syllabus\" y on y.id=s.syllabus_id where y.user_id=?",uid(r))); }
  @GetMapping("/api/syllabus/{id}") public Map<String,Object> syllabus(HttpServletRequest r,@PathVariable String id) { requireOwner("select id from \"Syllabus\" where id=? and user_id=?",id,uid(r),"Syllabus file not found."); return Map.of("syllabus",syllabusTree(id)); }
  @DeleteMapping("/api/syllabus/{id}") public Map<String,Object> deleteSyllabus(HttpServletRequest r,@PathVariable String id) { requireOwner("select id from \"Syllabus\" where id=? and user_id=?",id,uid(r),"Syllabus file not found."); db.update("delete from \"Syllabus\" where id=?",id); return msg("Syllabus file and extracted topics deleted successfully."); }
  @PutMapping("/api/syllabus/subjects/{id}") public Map<String,Object> renameSubject(HttpServletRequest r,@PathVariable String id,@RequestBody Map<String,Object>b) { requireOwner("select s.id from \"Subject\" s join \"Syllabus\" y on y.id=s.syllabus_id where s.id=? and y.user_id=?",id,uid(r),"Subject not found."); db.update("update \"Subject\" set name=? where id=?",s(b,"name"),id); return Map.of("message","Subject updated.","subject",one("select * from \"Subject\" where id=?",id)); }
  @PutMapping("/api/syllabus/topics/{id}") public Map<String,Object> updateTopic(HttpServletRequest r,@PathVariable String id,@RequestBody Map<String,Object>b) { requireOwner("select t.id from \"Topic\" t join \"Module\" m on m.id=t.module_id join \"Subject\" s on s.id=m.subject_id join \"Syllabus\" y on y.id=s.syllabus_id where t.id=? and y.user_id=?",id,uid(r),"Topic not found."); db.update("update \"Topic\" set name=coalesce(?,name), status=coalesce(?,status) where id=?",s(b,"name"),s(b,"status"),id); return Map.of("message","Topic updated.","topic",one("select * from \"Topic\" where id=?",id)); }
  @PostMapping("/api/syllabus/topics") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> createTopic(HttpServletRequest r,@RequestBody Map<String,Object>b) { String user=uid(r),mid=s(b,"module_id"); requireOwner("select m.id from \"Module\" m join \"Subject\" s on s.id=m.subject_id join \"Syllabus\" y on y.id=s.syllabus_id where m.id=? and y.user_id=?",mid,user,"Module not found."); String id=UUID.randomUUID().toString(); db.update("insert into \"Topic\"(id,module_id,name,status) values(?,?,?,'PENDING')",id,mid,s(b,"name")); return Map.of("message","Topic created.","topic",one("select * from \"Topic\" where id=?",id)); }
  @DeleteMapping("/api/syllabus/topics/{id}") public Map<String,Object> deleteTopic(HttpServletRequest r,@PathVariable String id) { requireOwner("select t.id from \"Topic\" t join \"Module\" m on m.id=t.module_id join \"Subject\" s on s.id=m.subject_id join \"Syllabus\" y on y.id=s.syllabus_id where t.id=? and y.user_id=?",id,uid(r),"Topic not found."); db.update("delete from \"Topic\" where id=?",id); return msg("Topic deleted."); }
  @Transactional @PutMapping("/api/syllabus/{id}") public Map<String,Object> updateSyllabus(HttpServletRequest r,@PathVariable String id,@RequestBody Map<String,Object>b) { requireOwner("select id from \"Syllabus\" where id=? and user_id=?",id,uid(r),"Syllabus not found or unauthorized."); if(b.containsKey("subject_name"))db.update("update \"Syllabus\" set subject_name=? where id=?",b.get("subject_name"),id); if(b.get("subjects") instanceof List<?> subjects){db.update("delete from \"Subject\" where syllabus_id=?",id); for(Object x:subjects)if(x instanceof Map<?,?> sub){String sid=UUID.randomUUID().toString();db.update("insert into \"Subject\"(id,syllabus_id,name) values(?,?,?)",sid,id,sub.get("name"));if(sub.get("modules") instanceof List<?> modules)for(Object m:modules)if(m instanceof Map<?,?> mod){String mid=UUID.randomUUID().toString();db.update("insert into \"Module\"(id,subject_id,name) values(?,?,?)",mid,sid,mod.get("name"));if(mod.get("topics") instanceof List<?> tops)for(Object t:tops){String nm=t instanceof Map<?,?> tm?String.valueOf(tm.get("name")):String.valueOf(t),status=t instanceof Map<?,?> tm&&tm.get("status")!=null?String.valueOf(tm.get("status")):"PENDING";db.update("insert into \"Topic\"(id,module_id,name,status) values(?,?,?,?)",UUID.randomUUID().toString(),mid,nm,status);}}} db.update("update \"Syllabus\" set status='PROCESSED' where id=?",id);} return Map.of("message","Syllabus updated successfully.","syllabus",syllabusTree(id)); }
  @PostMapping(value="/api/syllabus/upload",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @ResponseStatus(HttpStatus.CREATED)
  public Map<String,Object> upload(HttpServletRequest r,@RequestParam("files") List<MultipartFile> files) {
    String u=uid(r); if(files==null||files.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Please select at least one valid PDF syllabus file.");
    try { Path dir=Paths.get(uploadDir); Files.createDirectories(dir); var out=new ArrayList<Map<String,Object>>(); var errors=new ArrayList<String>();
      for(var f:files){ String original=Paths.get(Objects.requireNonNullElse(f.getOriginalFilename(),"syllabus.pdf")).getFileName().toString(); if(!original.toLowerCase().endsWith(".pdf")||f.getSize()>15L*1024*1024){errors.add(original+" could not be extracted automatically.");continue;}
        String saved="syllabus-"+System.currentTimeMillis()+"-"+UUID.randomUUID()+".pdf"; Path target=dir.resolve(saved); f.transferTo(target);
        String subject=original.replaceFirst("(?i)\\.pdf$","").replaceAll("[_-]+"," ").trim(); String id=UUID.randomUUID().toString();
        String status="PROCESSED";
        String extracted=""; try(var doc=org.apache.pdfbox.Loader.loadPDF(target.toFile())) { extracted=new org.apache.pdfbox.text.PDFTextStripper().getText(doc); if(extracted.isBlank()) status="FAILED"; }
        catch(Exception ex){status="FAILED";}
        db.update("insert into \"Syllabus\"(id,user_id,file_name,file_path,subject_name,status) values(?,?,?,?,?,?)",id,u,original,target.toString(),subject,status);
        if(status.equals("PROCESSED"))savePdfTopics(id,subject,extracted);
        out.add(one("select * from \"Syllabus\" where id=?",id)); if(status.equals("FAILED"))errors.add(original+" could not be extracted automatically.");
      }
      db.update("insert into \"Notification\"(id,user_id,title,message,type) values(?,?,?,?,?)",UUID.randomUUID().toString(),u,"Syllabus PDF(s) Processed","Processed "+files.size()+" syllabus PDF file(s). "+out.stream().filter(x->"PROCESSED".equals(x.get("status"))).count()+" successfully extracted.","INFO");
      var result=new LinkedHashMap<String,Object>(); result.put("message","Syllabus files uploaded and processed."); result.put("syllabi",out); if(!errors.isEmpty())result.put("errors",errors); return result;
    } catch(Exception e){throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Server error uploading syllabus files.",e);}
  }
  @Transactional @PostMapping("/api/syllabus/{id}/process") public Map<String,Object> processSyllabus(HttpServletRequest r,@PathVariable String id,@RequestBody(required=false) Map<String,Object>b) { String u=uid(r);requireOwner("select id from \"Syllabus\" where id=? and user_id=?",id,u,"Syllabus not found.");var y=one("select * from \"Syllabus\" where id=?",id);String subject=b==null||s(b,"subject_name")==null?String.valueOf(y.get("subject_name")):s(b,"subject_name");try{String txt;try(var doc=org.apache.pdfbox.Loader.loadPDF(Paths.get(String.valueOf(y.get("file_path"))).toFile())){txt=new org.apache.pdfbox.text.PDFTextStripper().getText(doc);}if(txt.isBlank())throw new IllegalArgumentException("Empty PDF");db.update("delete from \"Subject\" where syllabus_id=?",id);db.update("update \"Syllabus\" set subject_name=?,status='PROCESSED' where id=?",subject,id);savePdfTopics(id,subject,txt);return Map.of("message","Syllabus processed for subject "+subject+".","syllabus",syllabusTree(id));}catch(Exception e){db.update("update \"Syllabus\" set status='FAILED' where id=?",id);throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Extraction failed for "+y.get("file_name")+". You can add topics manually.");} }

  @GetMapping("/api/exams") public Map<String,Object> exams(HttpServletRequest r) { var exams=many("select e.* from \"Exam\" e where e.user_id=? order by e.exam_date",uid(r)); for(var e:exams)e.put("subject",one("select * from \"Subject\" where id=?",e.get("subject_id")));return Map.of("exams",exams); }
  @PostMapping("/api/exams") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> createExam(HttpServletRequest r,@RequestBody Map<String,Object>b) { String u=uid(r),sid=s(b,"subject_id"),d=s(b,"exam_date"); if(sid==null||d==null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Subject and Exam Date are required."); requireOwner("select s.id from \"Subject\" s join \"Syllabus\" y on y.id=s.syllabus_id where s.id=? and y.user_id=?",sid,u,"Selected subject not found in your syllabus."); String id=UUID.randomUUID().toString(); db.update("insert into \"Exam\"(id,user_id,subject_id,exam_date) values(?,?,?,?)",id,u,sid,d); generatePrep(u,id);var exam=one("select * from \"Exam\" where id=?",id);exam.put("subject",one("select * from \"Subject\" where id=?",sid));return Map.of("message","Exam scheduled successfully and Exam Prep timetable generated.","exam",exam); }
  @PutMapping("/api/exams/{id}") public Map<String,Object> updateExam(HttpServletRequest r,@PathVariable String id,@RequestBody Map<String,Object>b) { String u=uid(r);requireOwner("select id from \"Exam\" where id=? and user_id=?",id,u,"Exam not found."); db.update("update \"Exam\" set exam_date=? where id=?",s(b,"exam_date"),id);generatePrep(u,id);return Map.of("message","Exam date updated successfully.","exam",one("select * from \"Exam\" where id=?",id)); }
  @DeleteMapping("/api/exams/{id}") public Map<String,Object> deleteExam(HttpServletRequest r,@PathVariable String id) { requireOwner("select id from \"Exam\" where id=? and user_id=?",id,uid(r),"Exam not found."); db.update("delete from \"Exam\" where id=?",id); return msg("Exam deleted successfully."); }
  @PostMapping("/api/exams/prep-mode/generate") public Map<String,Object> prep(HttpServletRequest r,@RequestBody(required=false) Map<String,Object>b) { String u=uid(r);int count=generatePrep(u,b==null?null:s(b,"exam_id"));return count==0?Map.of("message","No upcoming exams found to prepare for.","count",0):Map.of("message","Exam preparation timetable generated successfully.","count",count); }

  @GetMapping("/api/timetable") public Map<String,Object> timetable(HttpServletRequest r,@RequestParam(required=false) String mode,@RequestParam(required=false) String status,@RequestParam(required=false) String startDate,@RequestParam(required=false) String endDate) {
    String u=uid(r); var sql=new StringBuilder("select ss.*,t.name topic_name,t.status topic_status,m.id module_join_id,m.name module_name,s.id subject_join_id,s.name subject_name from \"StudySession\" ss join \"Topic\" t on t.id=ss.topic_id join \"Module\" m on m.id=t.module_id join \"Subject\" s on s.id=m.subject_id where ss.user_id=?"); var args=new ArrayList<Object>(); args.add(u);
    if(mode!=null){sql.append(" and ss.mode=?");args.add(mode);} if(status!=null){sql.append(" and ss.status=?");args.add(status);} if(startDate!=null){sql.append(" and ss.date>=date(?)");args.add(startDate);} if(endDate!=null){sql.append(" and ss.date<=date(?)");args.add(endDate);} sql.append(" order by ss.date,ss.start_time"); var sessions=many(sql.toString(),args.toArray());for(var ss:sessions){var subject=Map.of("id",ss.remove("subject_join_id"),"name",ss.remove("subject_name"));var module=Map.of("id",ss.remove("module_join_id"),"name",ss.remove("module_name"),"subject",subject);var topic=new LinkedHashMap<String,Object>();topic.put("id",ss.get("topic_id"));topic.put("name",ss.remove("topic_name"));topic.put("status",ss.remove("topic_status"));topic.put("module",module);ss.put("topic",topic);if(ss.get("original_session_id")!=null)ss.put("originalSession",one("select * from \"StudySession\" where id=?",ss.get("original_session_id")));} return Map.of("sessions",sessions);
  }
  @PostMapping("/api/timetable/generate") public Map<String,Object> generateTimetable(HttpServletRequest r) { String u=uid(r); var profile=one("select daily_study_hours from \"StudentProfile\" where user_id=?",u); double hours=profile==null?3.0:((Number)profile.get("daily_study_hours")).doubleValue(); int perDay=Math.max(1,Math.min(6,(int)Math.floor(hours)));
    var topics=many("select t.id from \"Topic\" t join \"Module\" m on m.id=t.module_id join \"Subject\" s on s.id=m.subject_id join \"Syllabus\" y on y.id=s.syllabus_id where y.user_id=? and t.status<>'COMPLETED' order by s.id,m.id,t.id",u); if(topics.isEmpty())return Map.of("message","No pending topics found in syllabus.","count",0);
    db.update("delete from \"StudySession\" where user_id=? and mode='REGULAR' and status='PENDING' and date>=date('now')",u); String[] starts={"16:00","17:15","18:30","19:45","21:00","22:15"},ends={"17:00","18:15","19:30","20:45","22:00","23:15"}; int count=0;
    for(int d=0;d<14;d++)for(int slot=0;slot<perDay;slot++){var t=topics.get(count%topics.size());db.update("insert into \"StudySession\"(id,user_id,topic_id,date,start_time,end_time,mode,status) values(?,?,?,date('now','+' || ? || ' days'), ?,?,'REGULAR','PENDING')",UUID.randomUUID().toString(),u,t.get("id"),d,starts[slot],ends[slot]);count++;}
    db.update("insert into \"Notification\"(id,user_id,title,message,type) values(?,?,?,?,?)",UUID.randomUUID().toString(),u,"Multi-Subject Timetable Generated","Generated "+count+" sessions across syllabus based on "+hours+" daily study hours.","INFO"); return Map.of("message","Regular timetable generated successfully.","count",count);
  }
  @PostMapping("/api/timetable/{id}/complete") public Map<String,Object> complete(HttpServletRequest r,@PathVariable String id) { String u=uid(r); requireOwner("select id from \"StudySession\" where id=? and user_id=?",id,u,"Study session not found."); var ss=one("select * from \"StudySession\" where id=?",id); db.update("update \"StudySession\" set status='COMPLETED' where id=?",id); db.update("update \"Topic\" set status='COMPLETED' where id=?",ss.get("topic_id")); db.update("insert into \"Progress\"(id,user_id,topic_id,status,completed_at) values(?,?,?,'COMPLETED',CURRENT_TIMESTAMP)",UUID.randomUUID().toString(),u,ss.get("topic_id")); db.update("insert into \"Notification\"(id,user_id,title,message,type) values(?,?,?,?,?)",UUID.randomUUID().toString(),u,"Session Completed! 🎉","Great job! You completed your study session. Progress updated.","INFO"); return Map.of("message","Session marked as completed.","session",one("select * from \"StudySession\" where id=?",id)); }
  @PostMapping("/api/timetable/{id}/miss") public Map<String,Object> miss(HttpServletRequest r,@PathVariable String id) { String u=uid(r); requireOwner("select id from \"StudySession\" where id=? and user_id=?",id,u,"Study session not found."); var old=one("select * from \"StudySession\" where id=?",id);db.update("update \"StudySession\" set status='MISSED' where id=?",id);int day=8,daily=0;for(int d=1;d<=7;d++){int n=((Number)one("select count(*) c from \"StudySession\" where user_id=? and date=date('now','+' || ? || ' days') and status in ('PENDING','RESCHEDULED')",u,d).get("c")).intValue();if(n<4){day=d;daily=n;break;}}String start=String.format("%02d:%02d",16+(daily*75)/60,(daily*75)%60),end=String.format("%02d:%02d",17+(daily*75)/60,(daily*75)%60),newId=UUID.randomUUID().toString();db.update("insert into \"StudySession\"(id,user_id,topic_id,date,start_time,end_time,mode,status,original_session_id,rescheduled_from_id) values(?,?,?,date('now','+' || ? || ' days'), ?,?,?,'PENDING',?,?)",newId,u,old.get("topic_id"),day,start,end,old.get("mode"),old.get("original_session_id")==null?id:old.get("original_session_id"),id);return Map.of("message","Session marked as missed and automatically rescheduled.","rescheduledCount",1,"rescheduledSessions",List.of(one("select * from \"StudySession\" where id=?",newId))); }

  @GetMapping("/api/progress") public Map<String,Object> progress(HttpServletRequest r) { String u=uid(r); var topics=many("select t.status,s.id subject_id,s.name subject_name from \"Topic\" t join \"Module\" m on m.id=t.module_id join \"Subject\" s on s.id=m.subject_id join \"Syllabus\" y on y.id=s.syllabus_id where y.user_id=?",u); int completed=0,inProgress=0,pending=0; var bySubject=new LinkedHashMap<String,int[]>(); for(var t:topics){String id=""+t.get("subject_id"); var c=bySubject.computeIfAbsent(id,k->new int[]{0,0});c[0]++; if("COMPLETED".equals(t.get("status"))){c[1]++;completed++;}else if("IN_PROGRESS".equals(t.get("status")))inProgress++;else pending++;}
    var subjects=new ArrayList<Map<String,Object>>();for(var t:many("select id,name from \"Subject\" s join \"Syllabus\" y on y.id=s.syllabus_id where y.user_id=?",u)){int[]c=bySubject.getOrDefault(""+t.get("id"),new int[]{0,0});subjects.add(Map.of("subjectId",t.get("id"),"subjectName",t.get("name"),"totalTopics",c[0],"completedTopics",c[1],"percentage",c[0]==0?0:Math.round(c[1]*100f/c[0])));}
    var stats=one("select count(*) total, sum(case when status='COMPLETED' then 1 else 0 end) completed, sum(case when status='MISSED' then 1 else 0 end) missed, sum(case when status='PENDING' then 1 else 0 end) pending from \"StudySession\" where user_id=?",u); var p=one("select daily_study_hours from \"StudentProfile\" where user_id=?",u); int subCount=bySubject.size(); int syllabus=(int)one("select count(*) c from \"Syllabus\" where user_id=? and status='PROCESSED'",u).get("c");
    var result=new LinkedHashMap<String,Object>();result.put("overallPercentage",topics.isEmpty()?0:Math.round(completed*100f/topics.size()));result.put("processedPdfCount",syllabus);result.put("totalSubjectsCount",subCount);result.put("totalTopics",topics.size());result.put("completedTopicsCount",completed);result.put("inProgressTopicsCount",inProgress);result.put("pendingTopicsCount",pending);result.put("subjectProgress",subjects);result.put("sessionStats",Map.of("totalSessions",stats.get("total"),"completedSessions",stats.get("completed"),"missedSessions",stats.get("missed"),"pendingSessions",stats.get("pending")));result.put("streak",0);result.put("dailyHours",p==null?3.0:p.get("daily_study_hours"));return result;
  }

  @GetMapping("/api/notifications") public Map<String,Object> notifications(HttpServletRequest r) { String u=uid(r); return Map.of("notifications",many("select * from \"Notification\" where user_id=? order by created_at desc limit 50",u),"unreadCount",one("select count(*) c from \"Notification\" where user_id=? and is_read=false",u).get("c")); }
  @PutMapping("/api/notifications/{id}/read") public Map<String,Object> readNotification(HttpServletRequest r,@PathVariable String id) { String u=uid(r); if(id.equals("all")){db.update("update \"Notification\" set is_read=true where user_id=? and is_read=false",u); return msg("All notifications marked as read.");} requireOwner("select id from \"Notification\" where id=? and user_id=?",id,u,"Notification not found."); db.update("update \"Notification\" set is_read=true where id=?",id); return Map.of("message","Notification marked as read.","notification",one("select * from \"Notification\" where id=?",id)); }

  @GetMapping("/uploads/{file}") public org.springframework.http.ResponseEntity<byte[]> download(@PathVariable String file) { try { Path p=Paths.get(uploadDir).resolve(file).normalize(); if(!p.startsWith(Paths.get(uploadDir).normalize())||!Files.exists(p)) return org.springframework.http.ResponseEntity.notFound().build(); return org.springframework.http.ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).body(Files.readAllBytes(p)); } catch(Exception e){return org.springframework.http.ResponseEntity.notFound().build();} }
}
