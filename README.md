# Today Keyword

/user/:userId -> 유저 정보 불러오기
/user/signIn -> 로그인 및 회원가입
/user/profile/:userId -> 프로필 조회 및 수정 및 삭제
/user/bookmark -> 북마크 조회
/user/bookmark/:postId -> 북마크 추가 및 제거

/post -> 게시글 최신순 조회
/post/create -> 게시글 생성
/post/:postId -> 게시글 단건 조회
/post/:postId -> 게시글 상세 및 수정 및 삭제
/post/:postId/like -> 게시글 좋아요
/post/:postId/bookmark -> 게시글 북마크

/post/:postId/comment/create -> 댓글 생성
/post/:postId/comment/delete -> 댓글 삭제
/post/:postId/comment/:commentId -> 댓글 수정
/post/:postId/comment/:commentId/like -> 댓글 좋아요
