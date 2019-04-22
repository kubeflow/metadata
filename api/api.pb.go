// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Code generated by protoc-gen-go. DO NOT EDIT.
// source: api/api.proto

package api

import (
	context "context"
	fmt "fmt"
	proto "github.com/golang/protobuf/proto"
	_ "google.golang.org/genproto/googleapis/api/annotations"
	grpc "google.golang.org/grpc"
	math "math"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion3 // please upgrade the proto package

type Resource struct {
	Name                 string   `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *Resource) Reset()         { *m = Resource{} }
func (m *Resource) String() string { return proto.CompactTextString(m) }
func (*Resource) ProtoMessage()    {}
func (*Resource) Descriptor() ([]byte, []int) {
	return fileDescriptor_1b40cafcd4234784, []int{0}
}

func (m *Resource) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_Resource.Unmarshal(m, b)
}
func (m *Resource) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_Resource.Marshal(b, m, deterministic)
}
func (m *Resource) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Resource.Merge(m, src)
}
func (m *Resource) XXX_Size() int {
	return xxx_messageInfo_Resource.Size(m)
}
func (m *Resource) XXX_DiscardUnknown() {
	xxx_messageInfo_Resource.DiscardUnknown(m)
}

var xxx_messageInfo_Resource proto.InternalMessageInfo

func (m *Resource) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

type GetResourceRequest struct {
	Name                 string   `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *GetResourceRequest) Reset()         { *m = GetResourceRequest{} }
func (m *GetResourceRequest) String() string { return proto.CompactTextString(m) }
func (*GetResourceRequest) ProtoMessage()    {}
func (*GetResourceRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_1b40cafcd4234784, []int{1}
}

func (m *GetResourceRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_GetResourceRequest.Unmarshal(m, b)
}
func (m *GetResourceRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_GetResourceRequest.Marshal(b, m, deterministic)
}
func (m *GetResourceRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_GetResourceRequest.Merge(m, src)
}
func (m *GetResourceRequest) XXX_Size() int {
	return xxx_messageInfo_GetResourceRequest.Size(m)
}
func (m *GetResourceRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_GetResourceRequest.DiscardUnknown(m)
}

var xxx_messageInfo_GetResourceRequest proto.InternalMessageInfo

func (m *GetResourceRequest) GetName() string {
	if m != nil {
		return m.Name
	}
	return ""
}

func init() {
	proto.RegisterType((*Resource)(nil), "api.Resource")
	proto.RegisterType((*GetResourceRequest)(nil), "api.GetResourceRequest")
}

func init() { proto.RegisterFile("api/api.proto", fileDescriptor_1b40cafcd4234784) }

var fileDescriptor_1b40cafcd4234784 = []byte{
	// 181 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0xe2, 0xe2, 0x4d, 0x2c, 0xc8, 0xd4,
	0x4f, 0x2c, 0xc8, 0xd4, 0x2b, 0x28, 0xca, 0x2f, 0xc9, 0x17, 0x62, 0x4e, 0x2c, 0xc8, 0x94, 0x92,
	0x49, 0xcf, 0xcf, 0x4f, 0xcf, 0x49, 0xd5, 0x07, 0x4b, 0xe5, 0xe5, 0xe5, 0x97, 0x24, 0x96, 0x64,
	0xe6, 0xe7, 0x15, 0x43, 0x94, 0x28, 0xc9, 0x71, 0x71, 0x04, 0xa5, 0x16, 0xe7, 0x97, 0x16, 0x25,
	0xa7, 0x0a, 0x09, 0x71, 0xb1, 0xe4, 0x25, 0xe6, 0xa6, 0x4a, 0x30, 0x2a, 0x30, 0x6a, 0x70, 0x06,
	0x81, 0xd9, 0x4a, 0x1a, 0x5c, 0x42, 0xee, 0xa9, 0x25, 0x30, 0x25, 0x41, 0xa9, 0x85, 0xa5, 0xa9,
	0xc5, 0x25, 0xd8, 0x54, 0x1a, 0x65, 0x72, 0xf1, 0xfb, 0xa6, 0x96, 0x24, 0xa6, 0x24, 0x96, 0x24,
	0x06, 0xa7, 0x16, 0x95, 0x65, 0x26, 0xa7, 0x0a, 0x85, 0x71, 0x71, 0x23, 0x69, 0x16, 0x12, 0xd7,
	0x03, 0x39, 0x0d, 0xd3, 0x38, 0x29, 0x5e, 0xb0, 0x04, 0x4c, 0x54, 0x49, 0xbe, 0xe9, 0xf2, 0x93,
	0xc9, 0x4c, 0x92, 0x42, 0xe2, 0x60, 0x37, 0x97, 0x19, 0xea, 0x17, 0x41, 0x65, 0xf4, 0xab, 0x41,
	0x36, 0xd5, 0x26, 0xb1, 0x81, 0xdd, 0x6e, 0x0c, 0x08, 0x00, 0x00, 0xff, 0xff, 0xfe, 0xeb, 0xcc,
	0x52, 0xef, 0x00, 0x00, 0x00,
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConn

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion4

// MetadataServiceClient is the client API for MetadataService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://godoc.org/google.golang.org/grpc#ClientConn.NewStream.
type MetadataServiceClient interface {
	GetResource(ctx context.Context, in *GetResourceRequest, opts ...grpc.CallOption) (*Resource, error)
}

type metadataServiceClient struct {
	cc *grpc.ClientConn
}

func NewMetadataServiceClient(cc *grpc.ClientConn) MetadataServiceClient {
	return &metadataServiceClient{cc}
}

func (c *metadataServiceClient) GetResource(ctx context.Context, in *GetResourceRequest, opts ...grpc.CallOption) (*Resource, error) {
	out := new(Resource)
	err := c.cc.Invoke(ctx, "/api.MetadataService/GetResource", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// MetadataServiceServer is the server API for MetadataService service.
type MetadataServiceServer interface {
	GetResource(context.Context, *GetResourceRequest) (*Resource, error)
}

func RegisterMetadataServiceServer(s *grpc.Server, srv MetadataServiceServer) {
	s.RegisterService(&_MetadataService_serviceDesc, srv)
}

func _MetadataService_GetResource_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetResourceRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(MetadataServiceServer).GetResource(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/api.MetadataService/GetResource",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(MetadataServiceServer).GetResource(ctx, req.(*GetResourceRequest))
	}
	return interceptor(ctx, in, info, handler)
}

var _MetadataService_serviceDesc = grpc.ServiceDesc{
	ServiceName: "api.MetadataService",
	HandlerType: (*MetadataServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "GetResource",
			Handler:    _MetadataService_GetResource_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "api/api.proto",
}
