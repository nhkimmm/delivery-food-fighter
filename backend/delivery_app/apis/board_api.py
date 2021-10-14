"""
board api
게시판 관리 api
"""
from flask import Blueprint, request, jsonify

from delivery_app.utils import boto3_client
from delivery_app.services.logdata import add_logdata
from delivery_app.services.board import (
    get_post,
    get_posts,
    add_post,
    delete_post,
    edit_post,
)

bp = Blueprint("board", __name__)


@bp.route("/<int:id>", methods=["GET"])
def get_board(id):
    l = add_logdata(id)
    # print(l.to_dict())
    result = get_post(id)
    if result is not None:
        return jsonify(result="success", post=result.to_dict())
    else:
        return jsonify(result="fail", message="존재하지 않는 게시글입니다."), 404


@bp.route("/list", methods=["GET"])
def get_boards():
    """
    DB에 저장되어 있는 게시글 불러오기
    """
    result = []
    location1 = request.args.get("location1")
    location2 = request.args.get("location2")
    food = request.args.get("food")
    print(location1, location2, food)
    posts = get_posts(location1, location2, food)
    for post in posts:
        result.append(post.to_dict())

    boto3_client.boto3_test()

    return jsonify(result="success", posts=result)


@bp.route("/", methods=["POST"])
def post_board():
    """
    입력받은 게시글 DB에 저장하기
    """
    location1 = request.form.get("location1")
    location2 = request.form.get("location2")
    food = request.form.get("food")
    post = request.form.get("post")
    user = None
    image = request.files["image"]
    
    image_url = boto3_client.boto3_image_upload(image)
    try:
        new_post_id = add_post(
            location1=location1,
            location2=location2,
            food=food,
            post=post,
            user=user,
            image=image_url,
        )
    except Exception:
        boto3_client.boto3_image_delete(image_url)
        raise
    return jsonify(result="success", postId=new_post_id)


@bp.route("/<int:id>", methods=["DELETE"])
def delete_board(id):
    result = delete_post(id)
    if result is None:
        return jsonify(result="fail", message="존재하지 않는 게시글입니다."), 404

    return jsonify(result="success")


@bp.route("/<int:id>", methods=["PATCH"])
def edit_board(id):
    location1 = request.json.get("location1")
    location2 = request.json.get("location2")
    food = request.json.get("food")
    post = request.json.get("post")
    image = None

    result = edit_post(id, location1, location2, food, post, image)
    print(result)
    if result is None:
        return jsonify(result="fail", message="존재하지 않는 게시글입니다."), 404

    return jsonify(result="success")
