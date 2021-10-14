import { useState, useRef, useEffect, useCallback } from "react"
import dummy from "../data/dummy"
import DropBox from "./DropBox"
import styled from "styled-components"
import { TextField, Button } from "@mui/material"
import { updatePostRequest, wholeBoardRequest } from "../apis/boardApi"
import postValueCheck from "../utils/postValueCheck"
import {
  AddPostContainer,
  ButtonBox,
  FileBox,
  MyTextField,
  MyButton,
} from "../styles/addPostContainer"


// 컬러 속성을 지정하여 파일 선택창에서 원하지 않는 텍스트는 안보이도록 함 
const Input = styled.div`
  color: transparent;
  max-width: 8vw;
  position: sticky;
`

// location1: 시도 이름
// location2: 시군구 이름
// food: 음식 종류
// post: 글 내용
// image: 이미지 url
// user: 작성자

const EditPost = ({ postData, popClose, updatePost }) => {
  console.log(postData)
  const { location1, location2, food, post, image, id } = postData
  const [inputValue, setInputValue] = useState({
    location1: location1,
    location2: location2,
    food: food,
  })
  const [inputText, setInputText] = useState(post)
  const [inputImg, setInputImg] = useState(image)

  const handleSelectChange = useCallback(
    value => {
      const { location1, location2, food } = value
      setInputValue({ ...inputValue, location1, location2, food })
    },
    [inputValue],
  )

  const handleTextChange = useCallback(
    e => {
      setInputText(e.target.value)
    },
    [inputText],
  )

  const handleImgChange = useCallback(
    e => {
      const img = e.target.files[0]
      setInputImg(img)
    },
    [inputImg],
  )

  const clickSubmit = useCallback(() => {
    const check = postValueCheck(inputValue, inputText, inputImg)

    if (!check) return

    const newData = {
      image: inputImg,
      location1: location1,
      location2: location2,
      food: food,
      post: post,
    }

    updatePostRequest({ newData, id })
      .then(data => {
        console.log(data)
      })
      .then(() => {
        wholeBoardRequest().then(data => {
          const posts = data.posts.sort((a, b) => {
            return a.id > b.id ? -1 : 1
          })
          updatePost(posts)
        })
      })
      .catch(error => {
        console.error(error)
      })

    popClose()
  }, [inputValue, inputText, inputImg])

  const clickCancel = useCallback(() => {
    popClose()
  }, [inputValue, inputText, inputImg])

  return (
    <AddPostContainer>
      <DropBox
        options={dummy}
        onChange={handleSelectChange}
        defaultValue={{ location1: location1, location2: location2, food: food }}
      />
      <FileBox>
        <div>
        <Input>
        <input
          name="img"
          type="file"
          id="aa"
          title="Choose a video please" 
          accept="image/jpg,image/jpeg,image/png"
          onChange={handleImgChange}
        />
        </Input>
        <img src={postData.image} alt="new"/>
        </div>
      </FileBox>
      <MyTextField
        name="text"
        id="text"
        multiline
        rows={3}
        placeholder="내용을 입력해주세요"
        value={inputText}
        onChange={handleTextChange}
        required
        variant="standard"
        sx={{ height: "100%" }}
      />
      <ButtonBox>
        <MyButton onClick={clickCancel} variant="outlined">
          취소
        </MyButton>
        <MyButton onClick={clickSubmit} variant="outlined">
          글쓰기
        </MyButton>
      </ButtonBox>
    </AddPostContainer>
  )
}

export default EditPost
